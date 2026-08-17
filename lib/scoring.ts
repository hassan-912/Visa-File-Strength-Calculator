// ─── Scoring Data Model ───────────────────────────────────────────────────────
// IMPORTANT: Percentage scores are NEVER shown in the UI.
// These weights are internal calculation values only.
// Age is handled separately via a number input — not a category.

export interface Option {
  id: string;       // Unique string ID — used as React key (NOT the value)
  label: string;    // Display label — NO % shown in UI
  value: number;    // Internal scoring weight (hidden from UI)
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  description: string;
  maxScore: number;   // Internal max — hidden from UI. Category score is capped at this.
  inputType?: "radio" | "checkbox"; // UI input control type
  options: Option[];
}

export interface Penalty {
  id: string;
  label: string;
  description: string;
  deduction: number; // Internal deduction (hidden from UI)
}

// ─── Base Score Categories ─────────────────────────────────────────────────────
// Note: "Age Bracket" has been removed — age is now a <input type="number"> field.
// Note: "None / 0%" options removed — unchecked = 0 contribution automatically.
// Each option has a unique `id` to safely serve as React key.

export const CATEGORIES: Category[] = [
  {
    id: "education",
    title: "Education Level",
    icon: "🎓",
    description: "Select your highest completed academic qualification",
    maxScore: 9,
    inputType: "radio",
    options: [
      { id: "edu_opt_1", label: "Higher degree", value: 9 },
      { id: "edu_opt_2", label: "Intermediate degree", value: 4 },
      { id: "edu_opt_3", label: "No degree", value: 0 },
    ],
  },
  {
    id: "employment",
    title: "Employment Status",
    icon: "💼",
    description: "Select your current employment situation",
    maxScore: 5,
    inputType: "radio",
    options: [
      { id: "emp_opt_1", label: "Employed at a company for 1+ years", value: 5 },
      { id: "emp_opt_2", label: "Business owner for 6+ months", value: 5 },
      { id: "emp_opt_3", label: "Employed at a company for less than 1 year", value: 0 },
    ],
  },
  {
    id: "marital",
    title: "Marital Status",
    icon: "💍",
    description: "Select your marital status",
    maxScore: 5,
    inputType: "radio",
    options: [
      { id: "mar_opt_1", label: "Married with children", value: 5 },
      { id: "mar_opt_2", label: "Married without children", value: 3 },
      { id: "mar_opt_3", label: "Single", value: 0 },
    ],
  },
  {
    id: "travel",
    title: "Travel History",
    icon: "✈️",
    description: "Select your travel history",
    maxScore: 29,
    inputType: "radio",
    options: [
      { id: "trav_opt_1", label: "USA, Canada, or UK history", value: 29 },
      { id: "trav_opt_2", label: "European countries (Schengen) history", value: 20 },
      { id: "trav_opt_3", label: "Asian countries history", value: 10 },
      { id: "trav_opt_4", label: "Arab countries history", value: 5 },
      { id: "trav_opt_5", label: "No travel history", value: 0 },
    ],
  },
  {
    id: "bank",
    title: "Bank Account (With Activity)",
    icon: "🏦",
    description: "Select your banking details",
    maxScore: 19,
    inputType: "radio",
    options: [
      { id: "bank_opt_1", label: "Local + Foreign currency account (6+ months)", value: 19 },
      { id: "bank_opt_2", label: "Local bank account (6+ months, balance 250k+)", value: 15 },
      { id: "bank_opt_3", label: "Foreign currency account only (6+ months, balance $3,000+)", value: 15 },
      { id: "bank_opt_4", label: "No bank account", value: 0 },
    ],
  },
  {
    id: "asset",
    title: "Asset Ownership",
    icon: "🏠",
    description: "Select all assets you own",
    maxScore: 19,
    inputType: "checkbox",
    options: [
      { id: "asset_opt_1", label: "House", value: 5 },
      { id: "asset_opt_2", label: "Land", value: 5 },
      { id: "asset_opt_3", label: "Apartment", value: 5 },
      { id: "asset_opt_4", label: "Vehicle", value: 4 },
      { id: "asset_opt_5", label: "No assets", value: 0 },
    ],
  },
  {
    id: "purpose",
    title: "Purpose of Travel",
    icon: "👨‍👩‍👧",
    description: "Select your travel purpose",
    maxScore: 10,
    inputType: "radio",
    options: [
      { id: "purp_opt_1", label: "Traveling alone (Married)", value: 10 },
      { id: "purp_opt_2", label: "Traveling alone (Single)", value: 0 },
      { id: "purp_opt_3", label: "Traveling with spouse", value: 0 },
      { id: "purp_opt_4", label: "Traveling with spouse and children", value: 0 },
      { id: "purp_opt_5", label: "Traveling with children", value: 0 },
    ],
  }
];

// ─── Risk Penalty Deductions ───────────────────────────────────────────────────

export const PENALTIES: Penalty[] = [
  {
    id: "personal_overstay",
    label: "Personal Visa Overstay History",
    description: "I have previously overstayed a visa or resided illegally in any country",
    deduction: 70,
  },
  {
    id: "relative_overstay",
    label: "First-Degree Relatives Overstay",
    description: "A parent, sibling, or child has a prior overstay or illegal stay on record",
    deduction: 50,
  },
  {
    id: "no_hr_letter",
    label: "No HR Letter Provided",
    description: "I cannot provide an official HR letter, employment contract, or proof of employment",
    deduction: 50,
  },
  {
    id: "inactive_business",
    label: "No Active Business Operations",
    description: "My registered business is currently inactive, dissolved, or I do not operate one",
    deduction: 30,
  },
  {
    id: "previous_rejection",
    label: "Previous Rejection History",
    description: "I received a visa refusal from any embassy previously",
    deduction: 10,
  },
];

// ─── Age Score Calculation ────────────────────────────────────────────────────
// Age is entered as a number; this function returns the internal score contribution.
// The returned value is NEVER displayed in the UI.

export const AGE_MAX_SCORE = 4;

export function getAgeScore(age: number | null): number {
  if (age === null || age < 18) return 0;
  if (age >= 45) return 0; // 45+
  if (age >= 25) return 4; // 25 – 44
  return 0;                // 18 – 24
}

// ─── Types ────────────────────────────────────────────────────────────────────

// Each category stores an array of selected option IDs
export type SelectionsMap = Record<string, string[]>;
export type PenaltiesMap = Record<string, boolean>;

// ─── Score Calculation ─────────────────────────────────────────────────────────

export function calculateScore(
  selections: SelectionsMap,
  activePenalties: PenaltiesMap,
  age: number | null
): {
  baseScore: number;
  totalDeductions: number;
  finalScore: number;
  ageScore: number;
  categoryScores: Record<string, { earned: number; max: number }>;
} {
  const categoryScores: Record<string, { earned: number; max: number }> = {};
  let baseScore = 0;

  for (const cat of CATEGORIES) {
    const selectedIds = selections[cat.id] ?? [];
    // Sum values of all checked options, then cap at the category's max
    const rawSum = cat.options
      .filter((opt) => selectedIds.includes(opt.id))
      .reduce((sum, opt) => sum + opt.value, 0);
    const earned = Math.min(rawSum, cat.maxScore);
    categoryScores[cat.id] = { earned, max: cat.maxScore };
    baseScore += earned;
  }

  // Add age score
  const ageScore = getAgeScore(age);
  baseScore += ageScore;
  categoryScores["age_input"] = { earned: ageScore, max: AGE_MAX_SCORE };

  const totalDeductions = PENALTIES.filter((p) => activePenalties[p.id]).reduce(
    (sum, p) => sum + p.deduction,
    0
  );

  const finalScore = Math.min(100, Math.max(0, baseScore - totalDeductions));

  return { baseScore, totalDeductions, finalScore, ageScore, categoryScores };
}

// ─── Status Label ─────────────────────────────────────────────────────────────

export function getScoreStatus(score: number): {
  label: string;
  sublabel: string;
  colorVar: string;
  bgColorVar: string;
  borderColorVar: string;
  emoji: string;
} {
  if (score >= 80) {
    return {
      label: "Strong File",
      sublabel: "Your application profile is well-positioned for a positive outcome.",
      colorVar: "var(--color-strong)",
      bgColorVar: "var(--color-strong-bg)",
      borderColorVar: "var(--color-strong-border)",
      emoji: "✅",
    };
  } else if (score >= 60) {
    return {
      label: "Moderate File",
      sublabel: "Your file has good elements but some areas may benefit from strengthening.",
      colorVar: "var(--color-moderate)",
      bgColorVar: "var(--color-moderate-bg)",
      borderColorVar: "var(--color-moderate-border)",
      emoji: "⚠️",
    };
  } else {
    return {
      label: "Weak File / High Risk",
      sublabel: "Your current profile carries significant risk factors. Professional consultation is strongly advised.",
      colorVar: "var(--color-weak)",
      bgColorVar: "var(--color-weak-bg)",
      borderColorVar: "var(--color-weak-border)",
      emoji: "🔴",
    };
  }
}
