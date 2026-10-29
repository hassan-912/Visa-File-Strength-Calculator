import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const compile = path => ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const context = { exports: {}, URLSearchParams };
vm.runInNewContext(compile("../lib/anabin.ts"), context);
const { mapAnabinMatches, degreeEquivalence, anabinSearchUrl, normalizeAnabinQuery } = context.exports;
const uniId = "111111111111111111111111";
const otherId = "222222222222222222222222";
const degreeId = "333333333333333333333333";
const countryId = "444444444444444444444444";
const institution = { _id: uniId, nameShort: "Example University", nameGerman: "Beispieluniversität", country: { _id: countryId, nameShort: "Ägypten" }, institutionType: { status: { nameShort: "H+" } } };
const degree = { _id: degreeId, nameShort: "Bachelor of Computer Science", fieldOfStudy: { nameShort: "Computer Science" }, country: institution.country, institutions: [{ _id: uniId }], equivalences: [{ equivalenceClass: "Entspricht", comment: "" }] };

test("university results show source status without copying addresses, contacts or commentary", () => {
  const records = mapAnabinMatches("institution", [{ ...institution, address: "private detail", description: "irrelevant narrative" }], "example");
  assert.equal(records.length, 1);
  assert.equal(records[0].status, "hplus");
  assert.equal(records[0].country, "Egypt");
  assert.equal(records[0].address, undefined);
  assert.equal(records[0].description, undefined);
});
test("a degree is associated only with the institutions actually linked by Anabin", () => {
  assert.equal(mapAnabinMatches("degree", [degree], "computer science", uniId, countryId)[0].association, "institution");
  assert.equal(mapAnabinMatches("degree", [{ ...degree, institutions: [{ _id: otherId }] }], "computer science", uniId, countryId).length, 0);
  assert.equal(mapAnabinMatches("degree", [{ ...degree, institutions: [] }], "computer science", uniId, countryId)[0].association, "country");
});
test("country mismatches, hidden records, duplicates and incidental description-only matches are excluded", () => {
  const wrongCountry = { ...degree, country: { _id: otherId, nameShort: "Other" } };
  assert.equal(mapAnabinMatches("degree", [wrongCountry], "computer science", uniId, countryId).length, 0);
  assert.equal(mapAnabinMatches("degree", [{ ...degree, hidden: true }], "computer science").length, 0);
  assert.equal(mapAnabinMatches("degree", [degree, degree], "computer science").length, 1);
  assert.equal(mapAnabinMatches("degree", [{ ...degree, nameShort: "Electrical Engineering", fieldOfStudy: {}, description: "computer science" }], "computer science").length, 0);
});
test("conditional and missing equivalence are never promoted to unconditional recognition", () => {
  assert.equal(degreeEquivalence(degree).status, "equivalent");
  assert.equal(degreeEquivalence({ ...degree, equivalences: [] }).status, "unknown");
  assert.equal(degreeEquivalence({ ...degree, equivalences: [{ equivalenceClass: "Entspricht", comment: "Only after additional study" }] }).status, "partial");
  assert.equal(degreeEquivalence({ ...degree, equivalences: [{ equivalenceClass: "Bedingt vergleichbar" }] }).status, "partial");
  assert.equal(degreeEquivalence({ ...degree, equivalences: [{ equivalenceClass: "Nicht vergleichbar" }] }).status, "negative");
});
test("the user's computer-scince example is normalized, and upstream requests stay bounded on the official host", () => {
  assert.equal(normalizeAnabinQuery(" Computer scince "), "computer science");
  const url = new URL(anabinSearchUrl("degree", "Computer scince", { country: { $oid: countryId } }));
  assert.equal(url.origin, "https://anabin.kmk.org");
  assert.equal(url.pathname, "/api/public/degree");
  assert.equal(url.searchParams.get("search"), "computer science");
  assert.equal(url.searchParams.get("limit"), "16");
});

async function route(query, fetch) {
  const ctx = { exports: {}, require: () => context.exports, Request, Response, URL, AbortSignal, fetch };
  vm.runInNewContext(compile("../app/api/anabin/route.ts"), ctx);
  return ctx.exports.GET(new Request(`http://localhost/api/anabin?${query}`));
}
test("invalid types, filter injection and malformed institution IDs never reach upstream", async () => {
  for (const query of ["kind=admin&q=example", "kind=institution&q=%24where", "kind=degree&q=computer&institution=invalid", `kind=degree&q=${"x".repeat(101)}`]) {
    const response = await route(query, () => { throw new Error("Must not fetch"); });
    assert.equal(response.status, 400);
  }
});
test("one-character queries do not issue a search", async () => {
  const response = await route("kind=institution&q=a", () => { throw new Error("Must not fetch"); });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).matches, []);
});
test("selected-university searches derive the country from its official record and exclude other universities", async () => {
  const calls = [];
  const response = await route(`kind=degree&q=computer%20scince&institution=${uniId}`, async url => {
    calls.push(String(url));
    return Response.json(String(url).includes(`/institution/${uniId}`) ? institution : [degree, { ...degree, _id: otherId, institutions: [{ _id: otherId }] }]);
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.query, "computer science");
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0].association, "institution");
  const degreeQuery = new URL(calls.find(url => url.includes("/degree?")));
  assert.equal(JSON.parse(degreeQuery.searchParams.get("filter")).country.$oid, countryId);
});
test("provider errors return a retryable failure, never a fabricated negative recognition", async () => {
  for (const fetch of [async () => { throw new Error("timeout"); }, async () => new Response("unavailable", { status: 503 }), async () => Response.json({ error: "bad shape" })]) {
    const response = await route("kind=institution&q=example", fetch);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const result = await response.json();
    assert.ok(result.error.includes("not a negative recognition"));
    assert.equal(result.matches, undefined);
  }
});
