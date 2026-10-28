import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function compile(path) {
  return ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
}
const context = { exports: {} };
vm.runInNewContext(compile("../lib/exchange-rates.ts"), context);
const { parseEgpRates, convertToEgp } = context.exports;
const now = Date.now();
const fixture = { result: "success", base_code: "EUR", time_last_update_unix: Math.floor(now / 1000) - 3600, time_next_update_unix: Math.floor(now / 1000) + 82800, rates: { EUR: 1, EGP: 60, SEK: 10 } };

test("EUR and SEK convert through one consistent provider snapshot", () => {
  const rates = parseEgpRates(fixture, now);
  assert.equal(convertToEgp(13092, "EUR", rates), 785520);
  assert.equal(convertToEgp(117000, "SEK", rates), 702000);
  assert.equal(convertToEgp(78000, "SEK", rates), 468000);
});
test("a changed provider rate changes the EGP total without editing the funding requirement", () => {
  const original = convertToEgp(13092, "EUR", parseEgpRates(fixture, now));
  const increased = convertToEgp(13092, "EUR", parseEgpRates({ ...fixture, rates: { ...fixture.rates, EGP: 65 } }, now));
  assert.equal(increased - original, 13092 * 5);
});
test("missing, non-positive and non-finite rates never produce an EGP estimate", () => {
  for (const value of [undefined, null, 0, -1, NaN, Infinity, "60"]) {
    assert.throws(() => parseEgpRates({ ...fixture, rates: { ...fixture.rates, EGP: value } }, now));
    assert.throws(() => parseEgpRates({ ...fixture, rates: { ...fixture.rates, SEK: value } }, now));
  }
  for (const value of [null, {}, { ...fixture, result: "error" }, { ...fixture, base_code: "USD" }]) assert.throws(() => parseEgpRates(value, now));
});
test("rates older than 48 hours or dated in the future are rejected", () => {
  assert.throws(() => parseEgpRates({ ...fixture, time_last_update_unix: now / 1000 - 49 * 3600 }, now));
  assert.throws(() => parseEgpRates({ ...fixture, time_last_update_unix: now / 1000 + 600 }, now));
  assert.throws(() => parseEgpRates({ ...fixture, time_next_update_unix: fixture.time_last_update_unix }, now));
});

async function requestRoute(fetch) {
  const route = { exports: {}, require: () => context.exports, Response, AbortSignal, fetch };
  vm.runInNewContext(compile("../app/api/exchange-rates/route.ts"), route);
  return route.exports.GET();
}
test("exchange-rate route returns only the conversion data the portal needs", async () => {
  const response = await requestRoute(async () => Response.json(fixture));
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.rates.EUR, 60);
  assert.equal(data.rates.SEK, 6);
  assert.deepEqual(Object.keys(data.rates).sort(), ["EUR", "SEK"]);
  assert.ok(data.updatedAt);
});
test("provider failure, invalid data and timeout return an uncached 503 without fake rates", async () => {
  for (const fetch of [async () => { throw new Error("network timeout"); }, async () => new Response("unavailable", { status: 429 }), async () => Response.json({ result: "error" })]) {
    const response = await requestRoute(fetch);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const data = await response.json();
    assert.ok(data.error);
    assert.equal(data.rates, undefined);
  }
});
