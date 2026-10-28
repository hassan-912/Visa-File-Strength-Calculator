import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../lib/job-seeker.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const context = { exports: {}, Intl };
vm.runInNewContext(compiled, context);
const { assessJobSeeker: assess, fundingFor } = context.exports;
const documents = { passport: "yes", insurance: "yes", funding: "yes" };
const germany = { ...documents, qualification: "foreign", age: "34", experience: "two", german: "b1", english: "none" };
const austria = { ...documents, accommodation: "yes", education: "mint", salary: "none", age: "34", years: "5", german: "a2", english: "none", austrianStudies: "none" };
const points = (result, prefix) => result.breakdown.find(item => item.label.startsWith(prefix)).points;

test("German funding uses exact monthly multiplication", () => {
  assert.equal(fundingFor("germany", 12).amount, 13092);
  assert.equal(fundingFor("training", 9).amount, 9819);
  assert.equal(fundingFor("training", 6).amount, 6546);
  for (const months of [-1, 0, 13, NaN, 2.5]) assert.equal(fundingFor("germany", months).amount, 13092);
});
test("Sweden funds match six and nine months; Austria remains an estimate", () => {
  assert.equal(fundingFor("sweden", 6).amount, 78000);
  assert.equal(fundingFor("sweden", 9).amount, 117000);
  assert.equal(fundingFor("austria", 6).amount, 7850.34);
  assert.equal(fundingFor("austria", 6).estimated, true);
});
test("German points route meets six points but still enforces language and qualification", () => {
  assert.equal(assess("germany", germany).total, 6);
  assert.equal(assess("germany", germany).meetsCriteria, true);
  assert.equal(assess("germany", { ...germany, german: "none", partial: "yes" }).meetsCriteria, false);
  assert.equal(assess("germany", { ...germany, qualification: "none" }).meetsCriteria, false);
  assert.equal(assess("germany", { ...germany, funding: "no" }).meetsCriteria, false);
});
test("German full recognition bypasses points and language, with documents still required", () => {
  const result = assess("germany", { ...documents, qualification: "recognised" });
  assert.equal(result.direct, true);
  assert.equal(result.total, null);
  assert.equal(result.meetsCriteria, true);
  assert.equal(assess("germany", { qualification: "recognised" }).meetsCriteria, false);
});
test("German age boundaries and experience tiers do not stack", () => {
  for (const [age, expected] of [[34, 2], [35, 1], [39, 1], [40, 0]]) assert.equal(points(assess("germany", { ...germany, age: String(age) }), "Age"), expected);
  assert.equal(points(assess("germany", { ...germany, experience: "five" }), "Relevant"), 3);
});
test("Austria reaches 70, awards two points a year and enforces category caps", () => {
  const result = assess("austria", austria);
  assert.equal(result.total, 70);
  assert.equal(result.meetsCriteria, true);
  assert.equal(points(assess("austria", { ...austria, years: "3.5" }), "Experience"), 7);
  const maximum = assess("austria", { ...austria, education: "phd", salary: "upper", research: "yes", awards: "yes", years: "30", austrianExperience: "yes", english: "c2", french: "yes", spanish: "yes", bcs: "yes", austrianStudies: "completed" });
  assert.equal(maximum.total, 100);
  assert.equal(points(maximum, "Languages"), 10);
  assert.equal(points(maximum, "Experience"), 20);
  assert.equal(points(maximum, "Qualifications"), 40);
});
test("Austria age cutoffs are exclusive and B1 language groups respect the cap", () => {
  for (const [age, expected] of [[34, 20], [35, 15], [39, 15], [40, 10], [44, 10], [45, 0]]) assert.equal(points(assess("austria", { ...austria, age: String(age) }), "Age"), expected);
  assert.equal(points(assess("austria", { ...austria, german: "none", french: "yes" }), "Languages"), 5);
  assert.equal(points(assess("austria", { ...austria, german: "none", french: "yes", spanish: "yes", bcs: "yes" }), "Languages"), 10);
});
test("Sweden requires second-cycle education, an outside application and funds", () => {
  const form = { ...documents, secondCycle: "yes", outsideSweden: "yes", purpose: "yes" };
  assert.equal(assess("sweden", form).meetsCriteria, true);
  assert.equal(assess("sweden", form).total, null);
  for (const key of Object.keys(form)) assert.equal(assess("sweden", { ...form, [key]: "no" }).meetsCriteria, false);
});
test("Training search enforces under 35, B1, school certificate and funds", () => {
  const form = { ...documents, age: "34", german: "b1", school: "yes" };
  assert.equal(assess("training", form).meetsCriteria, true);
  for (const changes of [{ age: "35" }, { age: "" }, { german: "a2" }, { school: "no" }, { funding: "no" }]) assert.equal(assess("training", { ...form, ...changes }).meetsCriteria, false);
});
test("Empty answers never pass any pathway", () => {
  for (const route of ["germany", "austria", "sweden", "training"]) assert.equal(assess(route, {}).meetsCriteria, false);
});
