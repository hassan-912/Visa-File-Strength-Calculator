import type { JobSeekerAnswers, JobSeekerAssessment, JobSeekerRoute } from "./job-seeker";

export interface JobSeekerReportRow {
  label: string;
  answer: string;
  explanation: string;
  points: number | null;
  maximum: number | null;
}

const yesNo = (value?: string) => value === "yes" ? "Yes" : value === "no" ? "No / not yet" : "Not supplied";
const languageName = (value?: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "Not selected";
const languageLevel = (value?: string) => value === "none" ? "Below A1 / no certificate" : value?.toUpperCase() || "Not selected";

// Report wording describes the existing MG calculation; it does not decide eligibility.
export function jobSeekerReportRows(route: JobSeekerRoute, form: JobSeekerAnswers, result: JobSeekerAssessment): JobSeekerReportRow[] {
  if (route === "sweden") return [
    { label: "Education", answer: yesNo(form.secondCycle), explanation: "A qualification equivalent to Swedish second-cycle studies must be documented.", points: null, maximum: null },
    { label: "Application location", answer: yesNo(form.outsideSweden), explanation: "The application must be made from outside Sweden.", points: null, maximum: null },
    { label: "Relevant experience", answer: `${form.years || "Not supplied"} years`, explanation: "Experience in the same field of study is recorded for the profile. This MG check sets no separate minimum and awards no points.", points: null, maximum: null },
  ];
  if (route === "training") return [
    { label: "Age", answer: form.age ? `${form.age} years` : "Not supplied", explanation: "This screening covers adults aged 18–34; the applicant must be under 35.", points: null, maximum: null },
    { label: "German", answer: languageLevel(form.german), explanation: "The selected MG screening requires B2 or higher. The official training-search source states B1; MG uses the requested stricter threshold.", points: null, maximum: null },
    { label: "School qualification", answer: form.school === "diploma" ? "Diploma" : form.school === "secondary" ? "Secondary school" : form.school === "none" ? "None" : "Not supplied", explanation: "A secondary-school certificate or diploma is required in this screening. Its university-access equivalence still needs verification.", points: null, maximum: null },
  ];
  return result.breakdown.map(item => {
    if (route === "germany") {
      if (item.label === "Age") return { ...item, answer: `${form.age || "Not supplied"} years`, explanation: "MG age policy: ages 18–35 earn 2 points; ages 36–39 earn 1; ages 40+ earn 0.", maximum: 2 };
      if (item.label === "Relevant experience") return { ...item, answer: ({ none: "Less than 2 qualifying years", two: "2+ years within the last 5 years", five: "5+ years within the last 7 years" } as Record<string, string>)[form.experience] || "Not selected", explanation: "Relevant experience after qualification: 2+ years in the last 5 years earn 2 points; 5+ years in the last 7 years earn 3. Only the selected tier counts.", maximum: 3 };
      return { ...item, answer: `${languageName(form.language)} · ${languageLevel(form.languageLevel)}`, explanation: form.language === "english" ? "English C1 or C2 earns 1 point; lower levels earn 0. English B2 is the minimum for the points route. Only one language counts." : "German A1 earns 0 points; A2 earns 1; B1 earns 2; B2, C1 or C2 earns 3. Only one language counts.", maximum: form.language === "english" ? 1 : 3 };
    }
    if (item.label === "Qualifications & skills") return { ...item, answer: `${({ none: "None of the listed qualifications", degree: "Higher education, 4+ years", mint: "MINT degree, 4+ years", phd: "PhD / habilitation" } as Record<string, string>)[form.education] || "Not selected"}; research / innovation: ${yesNo(form.research)}; awards: ${yesNo(form.awards)}`, explanation: "Education: 20 points for a qualifying 4+ year degree, 30 for MINT, or 40 for PhD/habilitation. Documented research adds 20 and recognised awards add 20. This category is capped at 40; salary is excluded.", maximum: 40 };
    if (item.label === "Relevant experience") return { ...item, answer: `${form.years || "0"} years; 6+ months of relevant work in Austria: ${yesNo(form.austrianExperience)}`, explanation: `${form.years || "0"} × 2 points per year, rounded down to whole points, plus ${form.austrianExperience === "yes" ? "10" : "0"} for the selected Austrian experience. The category is capped at 20.`, maximum: 20 };
    if (item.label === "Age") return { ...item, answer: `${form.age || "Not supplied"} years`, explanation: "Ages 18–34 earn 20 points; 35–39 earn 15; 40–44 earn 10; ages 45+ earn 0.", maximum: 20 };
    return { ...item, answer: `${languageName(form.language)} · ${languageLevel(form.languageLevel)}`, explanation: ["german", "english"].includes(form.language) ? "German or English: A1 earns 5 points; A2 or higher earns 10. Only the selected language counts, up to 10 points." : "French, Spanish, Bosnian, Croatian or Serbian at B1 or higher earns 5 points. Below B1 earns 0. Only the selected language counts.", maximum: ["german", "english"].includes(form.language) ? 10 : 5 };
  });
}
