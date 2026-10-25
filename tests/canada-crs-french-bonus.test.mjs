import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Exercise the actual TypeScript scoring engine without adding a test runner.
const source = fs.readFileSync(new URL("../lib/canada-crs.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context);
const { calculateCRS, DEFAULT_CRS_FORM, rawScoreToLang1Key, rawScoreToLang2Key } = context.exports;

const abilities = ["reading", "writing", "speaking", "listening"];

function languageKeys(prefix, key) {
  return Object.fromEntries(abilities.map((ability) => [`${prefix}_${ability}`, key]));
}

// User's Canada.ca example: IELTS R7/W7/S7/L8, TCF NCLC 7 in each skill,
// age 25, single, bachelor's degree, one year of foreign experience.
const example = {
  ...DEFAULT_CRS_FORM,
  age: "20_29",
  education: "bachelors",
  foreignWorkExp: "1_2_years",
  lang1_reading: rawScoreToLang1Key("IELTS", "reading", "ielts_r_70"),
  lang1_writing: rawScoreToLang1Key("IELTS", "writing", "ielts_w_70"),
  lang1_speaking: rawScoreToLang1Key("IELTS", "speaking", "ielts_s_70"),
  lang1_listening: rawScoreToLang1Key("IELTS", "listening", "ielts_l_80"),
  lang2_reading: rawScoreToLang2Key("TCF_Canada", "reading", "tcf_r_453"),
  lang2_writing: rawScoreToLang2Key("TCF_Canada", "writing", "tcf_w_10"),
  lang2_speaking: rawScoreToLang2Key("TCF_Canada", "speaking", "tcf_s_10"),
  lang2_listening: rawScoreToLang2Key("TCF_Canada", "listening", "tcf_l_458"),
};

test("Canada.ca example automatically scores 466, including 12 language and 50 bonus points", () => {
  const result = calculateCRS(example);
  assert.equal(result.lang1Score, 124);
  assert.equal(result.lang2Score, 12);
  assert.equal(result.skillTransferScore, 50);
  assert.equal(result.frenchBonusScore, 50);
  assert.equal(result.additionalScore, 50);
  assert.equal(result.total, 466);
});

test("old manual bonus values cannot suppress or award a bonus", () => {
  assert.equal(calculateCRS({ ...example, frenchClb: "none" }).total, 466);
  assert.equal(calculateCRS({ ...DEFAULT_CRS_FORM, frenchClb: "clb7_plus_english_high" }).frenchBonusScore, 0);
});

for (const ability of abilities) {
  test(`French ${ability} below NCLC 7 removes the bonus`, () => {
    for (const key of ["clb5_6", "clb4_or_less", "", "invalid"]) {
      assert.equal(calculateCRS({ ...example, [`lang2_${ability}`]: key }).frenchBonusScore, 0);
    }
  });

  test(`English ${ability} at CLB 4 gives 25, at CLB 5 gives 50`, () => {
    assert.equal(calculateCRS({ ...example, [`lang1_${ability}`]: "clb4" }).frenchBonusScore, 25);
    assert.equal(calculateCRS({ ...example, [`lang1_${ability}`]: "clb5" }).frenchBonusScore, 50);
  });
}

test("no French results means no French bonus", () => {
  const result = calculateCRS({ ...example, ...languageKeys("lang2", "clb4_or_less") });
  assert.equal(result.frenchBonusScore, 0);
  assert.equal(result.lang2Score, 0);
  assert.equal(result.total, 404);
});

test("French NCLC 7 with low or no English results gives 25", () => {
  for (const key of ["clb4", "less_than_clb4"]) {
    assert.equal(calculateCRS({ ...example, ...languageKeys("lang1", key) }).frenchBonusScore, 25);
  }
});

test("CLB 4 and CLB 5 retain identical basic points but different bonus eligibility", () => {
  const low = calculateCRS({ ...example, ...languageKeys("lang1", "clb4") });
  const high = calculateCRS({ ...example, ...languageKeys("lang1", "clb5") });
  assert.equal(low.lang1Score, 24);
  assert.equal(high.lang1Score, 24);
  assert.equal(low.frenchBonusScore, 25);
  assert.equal(high.frenchBonusScore, 50);
  assert.equal(high.total - low.total, 25);
});

const englishBoundaries = {
  IELTS: {
    low: ["ielts_r_35", "ielts_w_40", "ielts_s_40", "ielts_l_45"],
    high: ["ielts_r_40", "ielts_w_50", "ielts_s_50", "ielts_l_50"],
  },
  PTE_Core: {
    low: ["pte_r_33", "pte_w_41", "pte_s_42", "pte_l_28"],
    high: ["pte_r_42", "pte_w_51", "pte_s_51", "pte_l_39"],
  },
  CELPIP_G: {
    low: Array(4).fill("celpip_4"),
    high: Array(4).fill("celpip_5"),
  },
};

for (const [testType, bands] of Object.entries(englishBoundaries)) {
  test(`${testType} raw score conversion preserves the CLB 4/5 bonus boundary`, () => {
    for (const [tier, expected] of [["low", 25], ["high", 50]]) {
      const converted = Object.fromEntries(abilities.map((ability, i) => [
        `lang1_${ability}`, rawScoreToLang1Key(testType, ability, bands[tier][i]),
      ]));
      assert.equal(calculateCRS({ ...example, ...converted }).frenchBonusScore, expected);
    }
  });
}

test("TEF scores at NCLC 7 also award the automatic bonus", () => {
  const raw = ["tef_r_207", "tef_w_310", "tef_s_310", "tef_l_249"];
  const converted = Object.fromEntries(abilities.map((ability, i) => [
    `lang2_${ability}`, rawScoreToLang2Key("TEF_Canada", ability, raw[i]),
  ]));
  assert.equal(calculateCRS({ ...example, ...converted }).total, 466);
});

test("editing or resetting results recalculates without a stale manual bonus", () => {
  assert.equal(calculateCRS(example).frenchBonusScore, 50);
  assert.equal(calculateCRS({ ...example, lang2_writing: "clb5_6" }).frenchBonusScore, 0);
  assert.equal(calculateCRS({ ...example, lang1_writing: "clb4" }).frenchBonusScore, 25);
  assert.equal(calculateCRS(example).frenchBonusScore, 50);
  assert.equal(calculateCRS(DEFAULT_CRS_FORM).frenchBonusScore, 0);
});

test("spouse status does not change the French bonus or second-language cap", () => {
  const result = calculateCRS({ ...example, withSpouse: true, ...languageKeys("lang2", "clb9_plus") });
  assert.equal(result.frenchBonusScore, 50);
  assert.equal(result.lang2Score, 22);
});

test("automatic French bonus respects the overall 600 additional-points cap", () => {
  const result = calculateCRS({ ...example, provincialNomination: true, siblingInCanada: true });
  assert.equal(result.frenchBonusScore, 50);
  assert.equal(result.additionalScore, 600);
  assert.equal(result.total, 1016);
});
