export type JobSeekerRoute = "germany" | "austria" | "sweden" | "training";
export type JobSeekerAnswers = Record<string, string>;

export const JOB_SEEKER_SOURCES = {
  germany: "https://www.make-it-in-germany.com/en/visa-recognition/opportunity-card/job-search",
  austria: "https://www.migration.gv.at/en/types-of-immigration/permanent-immigration/very-highly-qualified-workers/",
  sweden: "https://www.migrationsverket.se/en/you-want-to-apply/work/look-for-work/look-for-work-or-start-a-business.html",
  training: "https://www.make-it-in-germany.com/en/visa-recognition/visa-types/training",
  anabin: "https://anabin.kmk.org/db/institutionen",
};

export const JOB_SEEKER_PROGRAMS = {
  germany: { country: "Germany", code: "DE", title: "Opportunity Card", duration: "Up to 12 months", monthly: 1091, months: 12, currency: "EUR" },
  austria: { country: "Austria", code: "AT", title: "Job Seeker Visa", duration: "6 months", monthly: null, months: 6, currency: "EUR" },
  sweden: { country: "Sweden", code: "SE", title: "Look for Work", duration: "Up to 9 months", monthly: 13000, months: 9, currency: "SEK" },
  training: { country: "Germany", code: "DE", title: "Vocational Training Search", duration: "Up to 9 months", monthly: 1091, months: 9, currency: "EUR" },
} as const;

export function fundingFor(route: JobSeekerRoute, months: number) {
  const program = JOB_SEEKER_PROGRAMS[route];
  const duration = Number.isInteger(months) && months >= 1 && months <= program.months ? months : program.months;
  // Austria's client-provided figure is a planning estimate, not a verified threshold.
  return { months: duration, amount: program.monthly === null ? 7850.34 : program.monthly * duration, estimated: program.monthly === null };
}

export function formatFunding(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: Number.isInteger(amount) ? 0 : 2 }).format(amount);
}

export interface JobSeekerAssessment {
  total: number | null;
  threshold: number | null;
  breakdown: { label: string; points: number }[];
  issues: string[];
  meetsCriteria: boolean;
  direct: boolean;
}

const level = (value: string) => ["none", "a1", "a2", "b1", "b2", "c1", "c2"].indexOf(value);
const number = (value: string) => value?.trim() && Number.isFinite(Number(value)) ? Number(value) : -1;

export function assessJobSeeker(route: JobSeekerRoute, form: JobSeekerAnswers): JobSeekerAssessment {
  const issues: string[] = [];
  const breakdown: JobSeekerAssessment["breakdown"] = [];
  const requireYes = (key: string, message: string) => { if (form[key] !== "yes") issues.push(message); };
  const add = (label: string, points: number) => breakdown.push({ label, points });
  const age = number(form.age);
  let threshold: number | null = null;
  let direct = false;
  requireYes("passport", "Provide a passport valid for the requested stay.");
  requireYes("insurance", "Arrange health insurance covering the entire stay.");

  if (route === "germany") {
    direct = form.qualification === "recognised";
    if (!direct) {
      threshold = 6;
      if (form.qualification !== "foreign") issues.push("Document a qualifying state-recognised degree or vocational qualification (at least two years for vocational training).");
      if (level(form.german) < 1 && level(form.english) < 4) issues.push("Document German A1 or English B2 or higher.");
      if (age < 18 || age > 100) issues.push("Enter a valid adult age.");
      add("Age", age >= 18 && age < 35 ? 2 : age >= 35 && age < 40 ? 1 : 0);
      add("Partial recognition", form.partial === "yes" ? 4 : 0);
      add("Shortage occupation", form.shortage === "yes" ? 1 : 0);
      add("Relevant experience", form.experience === "five" ? 3 : form.experience === "two" ? 2 : 0);
      add("German", level(form.german) >= 4 ? 3 : level(form.german) === 3 ? 2 : level(form.german) === 2 ? 1 : 0);
      add("English C1+ / native", level(form.english) >= 5 ? 1 : 0);
      add("Previous qualifying stay", form.previousStay === "yes" ? 1 : 0);
      add("Eligible accompanying partner", form.partner === "yes" ? 1 : 0);
    }
    requireYes("funding", "Provide sufficient funding or an accepted declaration of commitment.");
  } else if (route === "austria") {
    threshold = 70;
    if (age < 18 || age > 100) issues.push("Enter a valid adult age.");
    const education = { none: 0, degree: 20, mint: 30, phd: 40 }[form.education] ?? 0;
    const salary = { none: 0, lower: 20, middle: 25, upper: 30 }[form.salary] ?? 0;
    add("Qualifications & skills (max 40)", Math.min(40, education + salary + (form.research === "yes" ? 20 : 0) + (form.awards === "yes" ? 20 : 0)));
    const years = number(form.years);
    if (years < 0 || years > 60) issues.push("Enter relevant experience between 0 and 60 years.");
    add("Experience (max 20)", Math.min(20, Math.floor(Math.max(0, Math.min(years, 60)) * 2) + (form.austrianExperience === "yes" ? 10 : 0)));
    const languagePoints = (value: string) => level(value) >= 2 ? 10 : level(value) === 1 ? 5 : 0;
    add("Languages (max 10)", Math.min(10, languagePoints(form.german) + languagePoints(form.english) + ["french", "spanish", "bcs"].filter(key => form[key] === "yes").length * 5));
    add("Age (max 20)", age >= 18 && age < 35 ? 20 : age >= 35 && age < 40 ? 15 : age >= 40 && age < 45 ? 10 : 0);
    add("Studies in Austria (max 10)", form.austrianStudies === "completed" ? 10 : form.austrianStudies === "half" ? 5 : 0);
    requireYes("accommodation", "Document accommodation in Austria.");
    requireYes("funding", "Confirm sufficient means of subsistence with the Austrian consulate; the displayed estimate is not an official threshold.");
  } else if (route === "sweden") {
    requireYes("secondCycle", "Document a qualification equivalent to Swedish second-cycle studies (such as a qualifying master's or PhD).");
    requireYes("outsideSweden", "Apply while you are outside Sweden.");
    requireYes("purpose", "Confirm your intention to seek work or explore starting a business.");
    requireYes("funding", "Document SEK 13,000 for each requested month plus funds for your return journey.");
  } else {
    if (age < 18 || age >= 35) issues.push("This check covers adults under 35; applicants aged 35 or over do not meet the age requirement.");
    if (level(form.german) < 3) issues.push("Document German at B1 or higher.");
    requireYes("school", "Provide a school-leaving certificate granting access to higher education in Germany or your home country, or a German school abroad qualification.");
    requireYes("funding", "Document €1,091 per requested month or an accepted declaration of commitment.");
  }

  const total = breakdown.length ? breakdown.reduce((sum, item) => sum + item.points, 0) : null;
  if (threshold !== null && (total ?? 0) < threshold) issues.push(`You need at least ${threshold} points; your current score is ${total ?? 0}.`);
  return { total, threshold, breakdown, issues, meetsCriteria: issues.length === 0, direct };
}
