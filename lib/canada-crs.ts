// ─────────────────────────────────────────────────────────────────
// Canada Express Entry — Comprehensive Ranking System (CRS)
// Official IRCC grid. Max total: 1,200 points.
// ─────────────────────────────────────────────────────────────────

export type WithSpouse = boolean;

// ── Age ──────────────────────────────────────────────────────────
const AGE_POINTS: Record<string, [number, number]> = {
  "17_or_less": [0, 0],
  "18":         [99, 90],
  "19":         [105, 95],
  "20_29":      [110, 100],
  "30":         [105, 95],
  "31":         [99, 90],
  "32":         [94, 85],
  "33":         [88, 80],
  "34":         [83, 75],
  "35":         [77, 70],
  "36":         [72, 65],
  "37":         [66, 60],
  "38":         [61, 55],
  "39":         [55, 50],
  "40":         [50, 45],
  "41":         [39, 35],
  "42":         [28, 25],
  "43":         [17, 15],
  "44":         [6, 5],
  "45_plus":    [0, 0],
};

// ── Education ────────────────────────────────────────────────────
const EDUCATION_POINTS: Record<string, [number, number]> = {
  "less_than_secondary":      [0, 0],
  "secondary":                [30, 28],
  "one_year":                 [90, 84],
  "two_year":                 [98, 91],
  "bachelors":                [120, 112],
  "two_or_more_creds":        [128, 119],
  "masters":                  [135, 126],
  "phd":                      [150, 140],
};

// ── Language per ability (CLB level → [single, spouse]) ──────────
const LANG1_PER_ABILITY: Record<string, [number, number]> = {
  "less_than_clb4": [0, 0],
  "clb4_5":         [6, 6],
  "clb6":           [9, 8],
  "clb7":           [17, 16],
  "clb8":           [23, 22],
  "clb9":           [31, 29],
  "clb10_plus":     [34, 32],
};

const LANG2_PER_ABILITY: Record<string, [number, number]> = {
  "clb4_or_less": [0, 0],
  "clb5_6":       [1, 1],
  "clb7_8":       [3, 3],
  "clb9_plus":    [6, 6],
};

// ── Canadian Work Experience ─────────────────────────────────────
const CAN_WORK_EXP_POINTS: Record<string, [number, number]> = {
  "none":    [0, 0],
  "1_year":  [40, 35],
  "2_years": [53, 46],
  "3_years": [64, 56],
  "4_years": [72, 63],
  "5_plus":  [80, 70],
};

// ── Spouse Factors ───────────────────────────────────────────────
const SPOUSE_EDUCATION: Record<string, number> = {
  "less_than_secondary":  0,
  "secondary":            2,
  "one_year":             6,
  "two_year":             7,
  "bachelors":            8,
  "two_or_more_creds":    9,
  "masters":              10,
  "phd":                  10,
};

const SPOUSE_LANG1_PER_ABILITY: Record<string, number> = {
  "clb4_or_less": 0,
  "clb5_6":       1,
  "clb7_8":       3,
  "clb9_plus":    5,
};

const SPOUSE_CAN_WORK_EXP: Record<string, number> = {
  "none":    0,
  "1_year":  5,
  "2_years": 7,
  "3_years": 8,
  "4_years": 9,
  "5_plus":  10,
};

// ── Helper: CLB level rank for comparisons ───────────────────────
function clbRank(key: string): number {
  const order: Record<string, number> = {
    "less_than_clb4": 0, "clb4_or_less": 0,
    "clb4_5": 1,
    "clb5_6": 2,
    "clb6": 3,
    "clb7": 4, "clb7_8": 4,
    "clb8": 5,
    "clb9": 6, "clb9_plus": 6, "clb9_plus_lang2": 6,
    "clb10_plus": 7,
  };
  return order[key] ?? 0;
}

// "Best" CLB across all 4 abilities for skill-transferability comparisons
function bestClb(abilities: string[]): number {
  return Math.max(...abilities.map(clbRank));
}

// ── Education tier helpers ────────────────────────────────────────
const EDU_1YR_PLUS = new Set(["one_year", "two_year", "bachelors", "two_or_more_creds", "masters", "phd"]);
const EDU_HIGH = new Set(["two_or_more_creds", "masters", "phd"]);

function isHighEdu(edu: string) { return EDU_HIGH.has(edu); }
function is1YrPlusEdu(edu: string) { return EDU_1YR_PLUS.has(edu); }

// ── Foreign Work Experience tiers ────────────────────────────────
const FOREIGN_EXP_1_2 = new Set(["1_2_years"]);
const FOREIGN_EXP_3_PLUS = new Set(["3_plus_years"]);

// ── Trades certificate ────────────────────────────────────────────
// represented as boolean in the form

// ─────────────────────────────────────────────────────────────────
// CRS Form shape
// ─────────────────────────────────────────────────────────────────
export interface CRSForm {
  // Profile
  withSpouse: boolean;

  // Core — Applicant
  age: string;
  education: string;
  lang1_reading: string;
  lang1_writing: string;
  lang1_speaking: string;
  lang1_listening: string;
  lang2_reading: string;
  lang2_writing: string;
  lang2_speaking: string;
  lang2_listening: string;
  canWorkExp: string;

  // Spouse
  spouse_education: string;
  spouse_lang1_reading: string;
  spouse_lang1_writing: string;
  spouse_lang1_speaking: string;
  spouse_lang1_listening: string;
  spouse_canWorkExp: string;

  // Skill Transferability inputs
  foreignWorkExp: string;            // "none" | "1_2_years" | "3_plus_years"
  tradesCertificate: boolean;

  // Additional Points
  siblingInCanada: boolean;
  frenchClb: string;                 // "none" | "clb7_plus_english_low" | "clb7_plus_english_high"
  postSecondaryCanada: string;       // "none" | "1_2_years" | "3_plus_years"
  arrangedEmployment: string;        // "none" | "noc00" | "other_noc"
  provincialNomination: boolean;
}

export interface CRSBreakdown {
  ageScore: number;
  educationScore: number;
  lang1Score: number;
  lang2Score: number;
  canWorkExpScore: number;
  spouseScore: number;
  skillTransferScore: number;
  additionalScore: number;
  total: number;
}

// ─────────────────────────────────────────────────────────────────
// Main calculation function
// ─────────────────────────────────────────────────────────────────
export function calculateCRS(form: CRSForm): CRSBreakdown {
  const ws = form.withSpouse;

  // ── A. Core Human Capital ─────────────────────────────────────
  const ageScore = (AGE_POINTS[form.age] ?? [0, 0])[ws ? 1 : 0];

  const educationScore = (EDUCATION_POINTS[form.education] ?? [0, 0])[ws ? 1 : 0];

  const lang1Abilities = [form.lang1_reading, form.lang1_writing, form.lang1_speaking, form.lang1_listening];
  const lang1Score = lang1Abilities.reduce((sum, key) => {
    return sum + (LANG1_PER_ABILITY[key] ?? [0, 0])[ws ? 1 : 0];
  }, 0);

  const lang2Abilities = [form.lang2_reading, form.lang2_writing, form.lang2_speaking, form.lang2_listening];
  const lang2Score = lang2Abilities.reduce((sum, key) => {
    return sum + (LANG2_PER_ABILITY[key] ?? [0, 0])[ws ? 1 : 0];
  }, 0);

  const canWorkExpScore = (CAN_WORK_EXP_POINTS[form.canWorkExp] ?? [0, 0])[ws ? 1 : 0];

  // ── B. Spouse Factors ────────────────────────────────────────
  let spouseScore = 0;
  if (ws) {
    spouseScore += SPOUSE_EDUCATION[form.spouse_education] ?? 0;

    const spouseLang1 = [
      form.spouse_lang1_reading,
      form.spouse_lang1_writing,
      form.spouse_lang1_speaking,
      form.spouse_lang1_listening,
    ];
    spouseScore += spouseLang1.reduce((sum, key) => sum + (SPOUSE_LANG1_PER_ABILITY[key] ?? 0), 0);

    spouseScore += SPOUSE_CAN_WORK_EXP[form.spouse_canWorkExp] ?? 0;
  }

  // ── C. Skill Transferability (cap 100) ───────────────────────
  let skillTransfer = 0;

  const bestLang1 = bestClb(lang1Abilities);
  const isLang1_7_8 = bestLang1 >= clbRank("clb7") && bestLang1 < clbRank("clb9");
  const isLang1_9Plus = bestLang1 >= clbRank("clb9");

  // Education + Language
  if (is1YrPlusEdu(form.education) && !isHighEdu(form.education)) {
    if (isLang1_9Plus) skillTransfer += 25;
    else if (isLang1_7_8) skillTransfer += 13;
  }
  if (isHighEdu(form.education)) {
    if (isLang1_9Plus) skillTransfer += 50;
    else if (isLang1_7_8) skillTransfer += 25;
  }

  // Education + Canadian Experience
  const hasCanExp1 = ["1_year", "2_years", "3_years", "4_years", "5_plus"].includes(form.canWorkExp);
  const hasCanExp2Plus = ["2_years", "3_years", "4_years", "5_plus"].includes(form.canWorkExp);

  if (is1YrPlusEdu(form.education) && !isHighEdu(form.education)) {
    if (hasCanExp2Plus) skillTransfer += 25;
    else if (hasCanExp1) skillTransfer += 13;
  }
  if (isHighEdu(form.education)) {
    if (hasCanExp2Plus) skillTransfer += 50;
    else if (hasCanExp1) skillTransfer += 25;
  }

  // Foreign Experience + Language
  const hasForeignExp1_2 = FOREIGN_EXP_1_2.has(form.foreignWorkExp);
  const hasForeignExp3Plus = FOREIGN_EXP_3_PLUS.has(form.foreignWorkExp);

  if (hasForeignExp1_2) {
    if (isLang1_9Plus) skillTransfer += 25;
    else if (isLang1_7_8) skillTransfer += 13;
  }
  if (hasForeignExp3Plus) {
    if (isLang1_9Plus) skillTransfer += 50;
    else if (isLang1_7_8) skillTransfer += 25;
  }

  // Foreign Experience + Canadian Experience
  if (hasForeignExp1_2) {
    if (hasCanExp2Plus) skillTransfer += 25;
    else if (hasCanExp1) skillTransfer += 13;
  }
  if (hasForeignExp3Plus) {
    if (hasCanExp2Plus) skillTransfer += 50;
    else if (hasCanExp1) skillTransfer += 25;
  }

  // Trades Certificate + Language
  if (form.tradesCertificate) {
    const bestLang1Rank = bestLang1;
    if (bestLang1Rank >= clbRank("clb7")) skillTransfer += 50;
    else if (bestLang1Rank >= clbRank("clb5_6")) skillTransfer += 13;
  }

  const skillTransferScore = Math.min(100, skillTransfer);

  // ── D. Additional Points (cap 600) ───────────────────────────
  let additional = 0;

  if (form.siblingInCanada) additional += 15;

  if (form.frenchClb === "clb7_plus_english_low") additional += 25;
  else if (form.frenchClb === "clb7_plus_english_high") additional += 50;

  if (form.postSecondaryCanada === "1_2_years") additional += 15;
  else if (form.postSecondaryCanada === "3_plus_years") additional += 30;

  if (form.arrangedEmployment === "noc00") additional += 200;
  else if (form.arrangedEmployment === "other_noc") additional += 50;

  if (form.provincialNomination) additional += 600;

  const additionalScore = Math.min(600, additional);

  // ── Total ────────────────────────────────────────────────────
  const total = Math.min(
    1200,
    ageScore + educationScore + lang1Score + lang2Score +
    canWorkExpScore + spouseScore + skillTransferScore + additionalScore
  );

  return {
    ageScore,
    educationScore,
    lang1Score,
    lang2Score,
    canWorkExpScore,
    spouseScore,
    skillTransferScore,
    additionalScore,
    total,
  };
}

// ── Human-readable label helpers ─────────────────────────────────
export const AGE_OPTIONS = [
  { value: "17_or_less", label: "17 or younger" },
  { value: "18",         label: "18" },
  { value: "19",         label: "19" },
  { value: "20_29",      label: "20–29" },
  { value: "30",         label: "30" },
  { value: "31",         label: "31" },
  { value: "32",         label: "32" },
  { value: "33",         label: "33" },
  { value: "34",         label: "34" },
  { value: "35",         label: "35" },
  { value: "36",         label: "36" },
  { value: "37",         label: "37" },
  { value: "38",         label: "38" },
  { value: "39",         label: "39" },
  { value: "40",         label: "40" },
  { value: "41",         label: "41" },
  { value: "42",         label: "42" },
  { value: "43",         label: "43" },
  { value: "44",         label: "44" },
  { value: "45_plus",    label: "45 or older" },
];

export const EDUCATION_OPTIONS = [
  { value: "less_than_secondary", label: "Less than secondary school" },
  { value: "secondary",           label: "Secondary diploma (high school)" },
  { value: "one_year",            label: "One-year post-secondary program" },
  { value: "two_year",            label: "Two-year post-secondary program" },
  { value: "bachelors",           label: "Bachelor's degree or 3+ year program" },
  { value: "two_or_more_creds",   label: "Two or more credentials (one 3+ years)" },
  { value: "masters",             label: "Master's or professional degree" },
  { value: "phd",                 label: "Doctoral degree (PhD)" },
];

export const LANG1_OPTIONS = [
  { value: "less_than_clb4", label: "Less than CLB 4" },
  { value: "clb4_5",         label: "CLB 4 or 5" },
  { value: "clb6",           label: "CLB 6" },
  { value: "clb7",           label: "CLB 7" },
  { value: "clb8",           label: "CLB 8" },
  { value: "clb9",           label: "CLB 9" },
  { value: "clb10_plus",     label: "CLB 10 or higher" },
];

export const LANG2_OPTIONS = [
  { value: "clb4_or_less", label: "CLB 4 or less" },
  { value: "clb5_6",       label: "CLB 5 or 6" },
  { value: "clb7_8",       label: "CLB 7 or 8" },
  { value: "clb9_plus",    label: "CLB 9 or higher" },
];

export const CAN_WORK_EXP_OPTIONS = [
  { value: "none",    label: "None / Less than 1 year" },
  { value: "1_year",  label: "1 year" },
  { value: "2_years", label: "2 years" },
  { value: "3_years", label: "3 years" },
  { value: "4_years", label: "4 years" },
  { value: "5_plus",  label: "5 years or more" },
];

export const SPOUSE_LANG1_OPTIONS = [
  { value: "clb4_or_less", label: "CLB 4 or less" },
  { value: "clb5_6",       label: "CLB 5 or 6" },
  { value: "clb7_8",       label: "CLB 7 or 8" },
  { value: "clb9_plus",    label: "CLB 9 or higher" },
];

export const FOREIGN_WORK_EXP_OPTIONS = [
  { value: "none",        label: "None" },
  { value: "1_2_years",   label: "1–2 years" },
  { value: "3_plus_years",label: "3 or more years" },
];

export const FRENCH_CLB_OPTIONS = [
  { value: "none",                   label: "Not applicable / Below CLB 7" },
  { value: "clb7_plus_english_low",  label: "French CLB 7+ and English CLB 4 or below" },
  { value: "clb7_plus_english_high", label: "French CLB 7+ and English CLB 5 or above" },
];

export const POST_SECONDARY_CANADA_OPTIONS = [
  { value: "none",        label: "None" },
  { value: "1_2_years",   label: "1 or 2 years" },
  { value: "3_plus_years",label: "3 or more years" },
];

export const ARRANGED_EMPLOYMENT_OPTIONS = [
  { value: "none",      label: "No arranged employment" },
  { value: "noc00",     label: "Yes — NOC TEER 0 Major Group 00 (Senior Managers)" },
  { value: "other_noc", label: "Yes — Other NOC TEER 0, 1, 2, or 3" },
];

export const DEFAULT_CRS_FORM: CRSForm = {
  withSpouse: false,
  age: "",
  education: "",
  lang1_reading: "less_than_clb4",
  lang1_writing: "less_than_clb4",
  lang1_speaking: "less_than_clb4",
  lang1_listening: "less_than_clb4",
  lang2_reading: "clb4_or_less",
  lang2_writing: "clb4_or_less",
  lang2_speaking: "clb4_or_less",
  lang2_listening: "clb4_or_less",
  canWorkExp: "none",
  spouse_education: "less_than_secondary",
  spouse_lang1_reading: "clb4_or_less",
  spouse_lang1_writing: "clb4_or_less",
  spouse_lang1_speaking: "clb4_or_less",
  spouse_lang1_listening: "clb4_or_less",
  spouse_canWorkExp: "none",
  foreignWorkExp: "none",
  tradesCertificate: false,
  siblingInCanada: false,
  frenchClb: "none",
  postSecondaryCanada: "none",
  arrangedEmployment: "none",
  provincialNomination: false,
};
