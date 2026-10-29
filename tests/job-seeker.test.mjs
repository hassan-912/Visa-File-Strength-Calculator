import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = fs.readFileSync(new URL("../lib/job-seeker.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const context = { exports: {}, Intl };
vm.runInNewContext(compiled, context);
const { assessJobSeeker: assess, fundingFor, checkBankFunds, parseBankBalance } = context.exports;
const fx = { rates: { EUR: 62.5, SEK: 6 }, updatedAt: new Date().toISOString(), nextUpdateAt: new Date(Date.now() + 86400000).toISOString() };
const german = { recognitionSource: "anabin", anabinInstitutionId: "111111111111111111111111", anabinDegreeId: "222222222222222222222222", anabinDegreeAssociation: "institution", institutionStatus: "hplus", degreeStatus: "equivalent", age: "25", experience: "two", language: "german", languageLevel: "b1", bankCurrency: "EUR", bankBalance: "13,092" };
const austria = { education: "mint", research: "no", awards: "no", age: "34", years: "5", austrianExperience: "no", language: "german", languageLevel: "a2", bankCurrency: "EUR", bankBalance: "7850.34" };
const training = { age: "34", german: "b2", school: "diploma", bankCurrency: "EUR", bankBalance: "9819" };
const sweden = { secondCycle: "yes", outsideSweden: "yes", years: "3", bankCurrency: "SEK", bankBalance: "117000" };
const points = (result, prefix) => result.breakdown.find(item => item.label.startsWith(prefix)).points;

test("Germany always requires 12 months; Austria always uses six", () => {
  for (const months of [0, 1, 6, 9, 12, 13, -1, NaN]) {
    assert.equal(fundingFor("germany", months).amount, 13092);
    assert.equal(fundingFor("germany", months).months, 12);
    assert.equal(fundingFor("austria", months).amount, 7850.34);
    assert.equal(fundingFor("austria", months).estimated, true);
  }
});
test("Sweden and training allow only six or nine months", () => {
  assert.equal(fundingFor("training", 6).amount, 6546);
  assert.equal(fundingFor("training", 9).amount, 9819);
  assert.equal(fundingFor("sweden", 6).amount, 78000);
  assert.equal(fundingFor("sweden", 9).amount, 117000);
  for (const months of [1, 3, 7, 12, -9, NaN, 6.5]) {
    assert.equal(fundingFor("training", months).months, 9);
    assert.equal(fundingFor("sweden", months).months, 9);
  }
});
test("balance parser supports grouped amounts and zero but rejects malformed or unsafe numbers", () => {
  for (const [raw, expected] of [["800,000", 800000], ["800000.50", 800000.5], [" 1,000.05 ", 1000.05], ["0", 0]]) assert.equal(parseBankBalance(raw), expected);
  for (const raw of ["", "-1", "1,23", "1e9", "£100", "NaN", "Infinity", "12.999", "999999999999999999999", "."]) assert.equal(parseBankBalance(raw), null);
});
test("zero balance is a real shortfall, never an unanswered field", () => {
  const check = checkBankFunds("germany", { bankBalance: "0", bankCurrency: "EUR" });
  assert.equal(check.status, "shortfall");
  assert.equal(check.shortfall, 13092);
});
test("same-currency exact and one-cent-below balances are correctly classified without an FX feed", () => {
  assert.equal(checkBankFunds("germany", german).status, "covered");
  assert.equal(checkBankFunds("germany", { ...german, bankBalance: "13091.99" }).shortfall, 0.01);
  assert.equal(checkBankFunds("austria", austria).status, "covered");
  assert.equal(checkBankFunds("austria", { ...austria, bankBalance: "7850.33" }).shortfall, 0.01);
});
test("an exchange-rate rise immediately changes EGP coverage and the shortfall", () => {
  const balance = { bankBalance: "818250", bankCurrency: "EGP" };
  assert.equal(checkBankFunds("germany", balance, fx).status, "covered");
  const increased = checkBankFunds("germany", balance, { ...fx, rates: { ...fx.rates, EUR: 63 } });
  assert.equal(increased.status, "shortfall");
  assert.equal(increased.shortfall, 6546);
});
test("conversion rounds the required amount upward to the next cent", () => {
  const rates = { ...fx, rates: { ...fx.rates, EUR: 62.4849 } };
  const needed = Math.ceil(13092 * rates.rates.EUR * 100 - 1e-7) / 100;
  assert.equal(checkBankFunds("germany", { bankCurrency: "EGP", bankBalance: String(needed) }, rates).status, "covered");
  assert.equal(checkBankFunds("germany", { bankCurrency: "EGP", bankBalance: (needed - 0.01).toFixed(2) }, rates).status, "shortfall");
});
test("currency conversion supports EGP and cross-currency EUR/SEK with one snapshot", () => {
  assert.equal(checkBankFunds("sweden", { bankCurrency: "EGP", bankBalance: "702000" }, fx).status, "covered");
  assert.equal(checkBankFunds("sweden", { bankCurrency: "EUR", bankBalance: "11232" }, fx).status, "covered");
  assert.equal(checkBankFunds("germany", { bankCurrency: "SEK", bankBalance: "136375" }, fx).status, "covered");
});
test("missing or stale rates never approve a converted balance", () => {
  const form = { bankBalance: "9999999", bankCurrency: "EGP" };
  for (const rates of [null, { ...fx, updatedAt: new Date(Date.now() - 49 * 3600000).toISOString() }, { ...fx, rates: { ...fx.rates, EUR: 0 } }]) assert.equal(checkBankFunds("germany", form, rates).status, "rates-unavailable");
  assert.equal(assess("germany", { ...german, ...form }).meetsCriteria, false);
});
test("a six-month balance becomes insufficient when switching to nine months", () => {
  assert.equal(checkBankFunds("training", { ...training, months: "6", bankBalance: "6546" }).status, "covered");
  assert.equal(checkBankFunds("training", { ...training, months: "9", bankBalance: "6546" }).shortfall, 3273);
  assert.equal(checkBankFunds("sweden", { ...sweden, months: "9", bankBalance: "78000" }).shortfall, 39000);
});
test("recognised university and degree still show every profile point", () => {
  const result = assess("germany", german);
  assert.equal(result.direct, true);
  assert.equal(result.total, 6);
  assert.equal(result.breakdown.length, 3);
  assert.equal(result.threshold, null);
  assert.equal(result.meetsCriteria, true);
});
test("a university listing alone cannot establish degree recognition", () => {
  for (const changes of [{ degreeStatus: "unknown" }, { degreeStatus: "negative" }, { institutionStatus: "unknown" }, { institutionStatus: "negative" }, { degreeStatus: "partial" }, { institutionStatus: "conditional" }]) {
    const result = assess("germany", { ...german, ...changes });
    assert.equal(result.direct, false);
    assert.equal(result.meetsCriteria, false);
  }
});
test("free text, manual status flags and country-only degree records cannot establish recognition", () => {
  for (const changes of [{ recognitionSource: "manual" }, { anabinInstitutionId: "" }, { anabinDegreeId: "" }, { anabinDegreeAssociation: "country" }, { anabinDegreeAssociation: "global" }]) {
    const result = assess("germany", { ...german, ...changes });
    assert.equal(result.direct, false);
    assert.equal(result.meetsCriteria, false);
  }
});
test("German age policy awards two points through 35 and one below 40", () => {
  for (const [age, expected] of [[34, 2], [35, 2], [36, 1], [39, 1], [40, 0]]) assert.equal(points(assess("germany", { ...german, age: String(age) }), "Age"), expected);
});
test("German language follows the requested table and never counts a second language", () => {
  for (const [level, expected] of [["a1", 0], ["a2", 1], ["b1", 2], ["b2", 3], ["c1", 3], ["c2", 3]]) assert.equal(points(assess("germany", { ...german, languageLevel: level, english: "c2" }), "German"), expected);
  for (const [level, expected] of [["a1", 0], ["a2", 0], ["b1", 0], ["b2", 0], ["c1", 1], ["c2", 1]]) assert.equal(points(assess("germany", { ...german, language: "english", languageLevel: level, german: "c2" }), "English"), expected);
});
test("removed German bonus inputs and experience tiers cannot stack hidden points", () => {
  const result = assess("germany", { ...german, experience: "five", partial: "yes", shortage: "yes", previousStay: "yes", partner: "yes" });
  assert.equal(result.total, 7);
  assert.equal(points(result, "Relevant"), 3);
});
test("Austria has no salary or Austrian study points, but retains experience and qualification caps", () => {
  assert.equal(assess("austria", austria).total, 70);
  assert.equal(assess("austria", { ...austria, salary: "upper", austrianStudies: "completed" }).total, 70);
  const maximum = assess("austria", { ...austria, education: "phd", research: "yes", awards: "yes", years: "30", austrianExperience: "yes" });
  assert.equal(maximum.total, 90);
  assert.equal(points(maximum, "Qualifications"), 40);
  assert.equal(points(maximum, "Relevant"), 20);
  assert.equal(points(assess("austria", { ...austria, years: "3.5" }), "Relevant"), 7);
});
test("Austria permits exactly one language, with the requested thresholds and ten-point cap", () => {
  for (const language of ["german", "english"]) {
    assert.equal(points(assess("austria", { ...austria, language, languageLevel: "a1" }), "Selected"), 5);
    assert.equal(points(assess("austria", { ...austria, language, languageLevel: "a2" }), "Selected"), 10);
  }
  for (const language of ["french", "spanish", "bosnian", "croatian", "serbian"]) {
    assert.equal(points(assess("austria", { ...austria, language, languageLevel: "a2" }), "Selected"), 0);
    assert.equal(points(assess("austria", { ...austria, language, languageLevel: "b1", german: "c2", english: "c2", french: "yes", spanish: "yes", bcs: "yes" }), "Selected"), 5);
  }
});
test("Austria retains the original age boundaries", () => {
  for (const [age, expected] of [[34, 20], [35, 15], [39, 15], [40, 10], [44, 10], [45, 0]]) assert.equal(points(assess("austria", { ...austria, age: String(age) }), "Age"), expected);
});
test("training uses B2 for MG screening, accepts diploma or secondary school and checks bank funds", () => {
  assert.equal(assess("training", training).meetsCriteria, true);
  assert.equal(assess("training", { ...training, school: "secondary" }).meetsCriteria, true);
  for (const changes of [{ age: "35" }, { german: "b1" }, { school: "none" }, { school: "" }, { school: "secondary_diploma" }, { bankBalance: "9818.99" }]) assert.equal(assess("training", { ...training, ...changes }).meetsCriteria, false);
});
test("Sweden records related experience without inventing an official minimum", () => {
  assert.equal(assess("sweden", sweden).meetsCriteria, true);
  assert.equal(assess("sweden", { ...sweden, years: "0", purpose: "no" }).meetsCriteria, true);
  for (const changes of [{ years: "" }, { years: "-1" }, { secondCycle: "no" }, { outsideSweden: "no" }, { bankBalance: "116999.99" }]) assert.equal(assess("sweden", { ...sweden, ...changes }).meetsCriteria, false);
});
test("removed passport, insurance and accommodation fields do not secretly block the simplified check", () => {
  assert.equal(assess("germany", german).meetsCriteria, true);
  assert.equal(assess("austria", austria).meetsCriteria, true);
  assert.equal(assess("training", training).meetsCriteria, true);
});
test("empty answers never pass any pathway", () => {
  for (const route of ["germany", "austria", "sweden", "training"]) assert.equal(assess(route, {}).meetsCriteria, false);
});
