import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

function readModule(path) {
  const source = fs.readFileSync(new URL(path, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const context = { exports: {}, Intl };
  vm.runInNewContext(compiled, context);
  return context.exports;
}
const { assessJobSeeker } = readModule("../lib/job-seeker.ts");
const { jobSeekerReportRows } = readModule("../lib/job-seeker-report.ts");

test("German report preserves every awarded point and explains the selected experience and language", () => {
  const form = { age: "19", experience: "two", language: "german", languageLevel: "b1", bankCurrency: "EUR", bankBalance: "13092" };
  const result = assessJobSeeker("germany", form);
  const rows = jobSeekerReportRows("germany", form, result);
  assert.equal(rows.reduce((total, row) => total + row.points, 0), result.total);
  assert.equal(rows[1].answer, "19 years");
  assert.equal(rows[1].points, 2);
  assert.match(rows[2].answer, /2\+ years within the last 5 years/);
  assert.equal(rows[3].answer, "German · B1");
  assert.match(rows[3].explanation, /B1 earns 2/);
  assert.equal(rows[3].points, 2);
});

test("English and Austrian language descriptions reflect one selected language and category caps", () => {
  const english = { age: "36", experience: "five", language: "english", languageLevel: "c1" };
  const enRows = jobSeekerReportRows("germany", english, assessJobSeeker("germany", english));
  assert.equal(enRows[3].maximum, 1);
  assert.equal(enRows[3].points, 1);
  assert.match(enRows[3].explanation, /Only one language counts/);
  const form = { education: "phd", years: "15.5", austrianExperience: "yes", age: "34", language: "french", languageLevel: "b1" };
  const rows = jobSeekerReportRows("austria", form, assessJobSeeker("austria", form));
  assert.equal(rows[0].points, 40);
  assert.equal(rows[0].answer, "PhD / habilitation");
  assert.doesNotMatch(rows[0].explanation, /research|award/i);
  assert.equal(rows[1].points, 20);
  assert.match(rows[1].explanation, /15.5 × 2.*plus 10/);
  assert.equal(rows[2].points, 5);
  assert.equal(rows[2].maximum, 5);
  assert.match(rows[2].answer, /French · B1/);
});

test("German report explains the four Anabin recognition points", () => {
  const form = { recognitionSource: "anabin", anabinInstitutionId: "111111111111111111111111", anabinDegreeId: "222222222222222222222222", anabinDegreeAssociation: "institution", institutionStatus: "hplus", degreeStatus: "equivalent", age: "25", experience: "two", language: "german", languageLevel: "b1" };
  const result = assessJobSeeker("germany", form);
  const rows = jobSeekerReportRows("germany", form, result);
  const anabin = rows.find(row => row.label === "Anabin recognition");
  assert.equal(anabin.points, 4);
  assert.equal(anabin.maximum, 4);
  assert.equal(rows.reduce((total, row) => total + row.points, 0), result.total);
  const partial = { ...form, degreeStatus: "partial" };
  assert.equal(jobSeekerReportRows("germany", partial, assessJobSeeker("germany", partial)).find(row => row.label === "Anabin recognition").points, 0);
});

test("requirements-based reports do not invent points and retain actual supplied answers", () => {
  for (const [route, form] of [["sweden", { secondCycle: "no", outsideSweden: "yes", years: "0" }], ["training", { age: "35", german: "b1", school: "none" }]]) {
    const rows = jobSeekerReportRows(route, form, assessJobSeeker(route, form));
    assert.equal(rows.length, 3);
    assert.ok(rows.every(row => row.points === null && row.maximum === null));
    if (route === "training") { assert.equal(rows[1].answer, "B1"); assert.match(rows[1].explanation, /MG screening requires B2/); assert.equal(rows[2].answer, "None"); }
    else { assert.equal(rows[0].answer, "No / not yet"); assert.equal(rows[2].answer, "0 years"); }
  }
});

test("training report preserves the distinct school qualification selected", () => {
  for (const [school, label] of [["diploma", "Diploma"], ["secondary", "Secondary school"], ["none", "None"]]) {
    const form = { age: "25", german: "b2", school };
    assert.equal(jobSeekerReportRows("training", form, assessJobSeeker("training", form))[2].answer, label);
  }
});
