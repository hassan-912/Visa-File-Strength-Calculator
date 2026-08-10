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
    id: "travel_history",
    title: "Travel History",
    icon: "✈️",
    description: "Select all countries or regions you have previously visited",
    maxScore: 25,
    inputType: "radio",
    options: [
      {
        id: "travel_opt_0",
        label: "US / CA / UK / Schengen (Multiple Visits)",
        value: 25,
      },
      {
        id: "travel_opt_1",
        label: "Single Schengen / JP / AU",
        value: 20,
      },
      {
        id: "travel_opt_2",
        label: "Asian / OECD / Gulf",
        value: 12,
      },
      {
        id: "travel_opt_3",
        label: "Regional",
        value: 5,
      },
      {
        id: "travel_opt_4",
        label: "None",
        value: 0,
      },
    ],
  },
  {
    id: "financial_health",
    title: "Financial Health & Banking",
    icon: "🏦",
    description: "Select all statements that accurately describe your banking situation",
    maxScore: 20,
    inputType: "radio",
    options: [
      {
        id: "financial_opt_0",
        label: "Dual Currency + Active Flow",
        value: 20,
      },
      {
        id: "financial_opt_1",
        label: "High Local Turnover >250k",
        value: 15,
      },
      {
        id: "financial_opt_2",
        label: "USD Account >$3k",
        value: 15,
      },
      {
        id: "financial_opt_3",
        label: "Low Movement",
        value: 5,
      },
      {
        id: "financial_opt_4",
        label: "None",
        value: 0,
      },
    ],
  },
  {
    id: "employment",
    title: "Employment & Professional Status",
    icon: "💼",
    description: "Select all options that apply to your current professional situation",
    maxScore: 15,
    inputType: "radio",
    options: [
      {
        id: "employment_opt_0",
        label: "Business Owner / Partner (Active > 2 years)",
        value: 15,
      },
      {
        id: "employment_opt_1",
        label: "Senior Professional / Doctor / Engineer / Executive (> 1 year)",
        value: 15,
      },
      {
        id: "employment_opt_2",
        label: "Mid-Level Employee in registered company (> 1 year)",
        value: 10,
      },
      {
        id: "employment_opt_3",
        label: "Junior Employee / Working < 1 year",
        value: 5,
      },
      {
        id: "employment_opt_4",
        label: "Freelancer / Unemployed / Unregistered",
        value: 0,
      },
    ],
  },
  {
    id: "property_assets",
    title: "Property & Registered Assets",
    icon: "🏠",
    description: "Select all assets you own that are officially registered in your name",
    maxScore: 15,
    options: [
      {
        id: "property_opt_0",
        label: "Multiple registered assets — Real estate plus land and/or a vehicle",
        value: 15,
      },
      {
        id: "property_opt_1",
        label: "Registered real estate — Apartment, house, or commercial property",
        value: 10,
      },
      {
        id: "property_opt_2",
        label: "Registered land plot or recently purchased vehicle",
        value: 5,
      },
      {
        id: "property_opt_3",
        label: "None",
        value: 0,
      },
    ],
  },
  {
    id: "social_ties",
    title: "Purpose of Travel & Social Ties",
    icon: "👨‍👩‍👧",
    description: "Select the option that best describes your travel situation and ties to your home country",
    maxScore: 10,
    inputType: "radio",
    options: [
      {
        id: "social_opt_0",
        label: "Married with children (Traveling alone)",
        value: 10,
      },
      {
        id: "social_opt_1",
        label: "Married without children (Traveling alone)",
        value: 7,
      },
      {
        id: "social_opt_2",
        label: "Family trip (Traveling with spouse & children)",
        value: 5,
      },
      {
        id: "social_opt_3",
        label: "Single / Single traveling alone",
        value: 3,
      },
    ],
  },
  {
    id: "education",
    title: "Education Level",
    icon: "🎓",
    description: "Select your highest completed academic qualification",
    maxScore: 8,
    inputType: "radio",
    options: [
      {
        id: "education_opt_0",
        label: "Higher Education (Bachelor's / Master's / PhD)",
        value: 8,
      },
      {
        id: "education_opt_1",
        label: "Intermediate Education / Diploma",
        value: 4,
      },
      {
        id: "education_opt_2",
        label: "None / No Formal Education",
        value: -4,
      },
    ],
  },
];

// ─── Risk Penalty Deductions ───────────────────────────────────────────────────

export const PENALTIES: Penalty[] = [
  {
    id: "overstay",
    label: "Previous Visa Overstay",
    description: "I have previously overstayed a visa or resided illegally in any country",
    deduction: 70,
  },
  {
    id: "relative_overstay",
    label: "First-Degree Relative Overstay",
    description: "A parent, sibling, or child has a prior overstay or illegal stay on record",
    deduction: 50,
  },
  {
    id: "shell_company",
    label: "Inactive or Shell Company",
    description: "My registered business is currently inactive, dissolved, or considered a shell company",
    deduction: 30,
  },
  {
    id: "no_hr_letter",
    label: "No HR Letter or Work Proof",
    description: "I cannot provide an official HR letter, employment contract, or proof of employment",
    deduction: 20,
  },
  {
    id: "visa_refusal",
    label: "Recent Visa Refusal",
    description: "I received a visa refusal from any embassy within the last 1 to 2 years",
    deduction: 10,
  },
];

// ─── Age Score Calculation ────────────────────────────────────────────────────
// Age is entered as a number; this function returns the internal score contribution.
// The returned value is NEVER displayed in the UI.

export const AGE_MAX_SCORE = 7;

export function getAgeScore(age: number | null): number {
  if (age === null || age < 18) return 0;
  if (age >= 45) return 7;
  if (age >= 25) return 5; // 25 – 44
  return 2;                // 18 – 24
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
