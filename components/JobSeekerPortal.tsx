"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import EgpEquivalent from "@/components/EgpEquivalent";
import { assessJobSeeker, fundingFor, formatFunding, JOB_SEEKER_PROGRAMS, JOB_SEEKER_SOURCES, type JobSeekerRoute, type JobSeekerAnswers } from "@/lib/job-seeker";

const LANGUAGES = [["none", "No certificate / below A1"], ["a1", "A1"], ["a2", "A2"], ["b1", "B1"], ["b2", "B2"], ["c1", "C1 / native"], ["c2", "C2"]] as const;
const YES_NO = [["yes", "Yes — evidence available"], ["no", "No / not yet"]] as const;
const EMPTY_FORMS: Record<JobSeekerRoute, JobSeekerAnswers> = { germany: {}, austria: {}, sweden: {}, training: {} };

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: ReactNode }) {
  return <div className="js-field"><label htmlFor={id}>{label}</label>{hint && <p id={`${id}-hint`}>{hint}</p>}{children}</div>;
}

function Section({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <section className="js-section"><h3><span>{number}</span>{title}</h3><div className="grid gap-5 sm:grid-cols-2">{children}</div></section>;
}

function OfficialLink({ href, children }: { href: string; children: ReactNode }) {
  return <a className="js-source" href={href} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true"> ↗</span><span className="sr-only"> (opens in a new tab)</span></a>;
}

export default function JobSeekerPortal() {
  const [route, setRoute] = useState<JobSeekerRoute>("germany");
  const [forms, setForms] = useState(EMPTY_FORMS);
  const [showResult, setShowResult] = useState(false);
  const form = forms[route];
  const program = JOB_SEEKER_PROGRAMS[route];
  const months = Number(form.months || program.months);
  const funding = fundingFor(route, months);
  const result = showResult ? assessJobSeeker(route, form) : null;
  const isGerman = route === "germany" || route === "training";
  const isDirect = route === "germany" && form.qualification === "recognised";

  function update(key: string, value: string) {
    setForms(previous => ({ ...previous, [route]: { ...previous[route], ...(key === "months" ? { funding: "" } : {}), [key]: value } }));
    setShowResult(false);
  }

  function selectRoute(value: JobSeekerRoute) {
    setRoute(value);
    setShowResult(false);
  }

  function select(key: string, label: string, options: readonly (readonly [string, string])[], hint?: string) {
    const id = `${route}-${key}`;
    return <Field id={id} label={label} hint={hint}><select id={id} name={key} value={form[key] ?? ""} onChange={event => update(key, event.target.value)} required aria-describedby={hint ? `${id}-hint` : undefined}><option value="" disabled>Select an answer</option>{options.map(([value, text]) => <option value={value} key={value}>{text}</option>)}</select></Field>;
  }

  function yesNo(key: string, label: string, hint?: string) { return select(key, label, YES_NO, hint); }

  function numeric(key: string, label: string, min: number, max: number, step = 1, hint?: string) {
    const id = `${route}-${key}`;
    return <Field id={id} label={label} hint={hint}><input id={id} name={key} type="number" inputMode={step === 1 ? "numeric" : "decimal"} min={min} max={max} step={step} required value={form[key] ?? ""} onChange={event => update(key, event.target.value)} aria-describedby={hint ? `${id}-hint` : undefined} placeholder={key === "age" ? "Age at application" : "e.g. 3.5"} /></Field>;
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowResult(true);
    requestAnimationFrame(() => {
      const resultElement = document.getElementById("job-seeker-result");
      resultElement?.focus({ preventScroll: true });
      resultElement?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" });
    });
  }

  return <>
    <section className="js-hero">
      <div className="mx-auto max-w-5xl px-4 py-11 text-center sm:px-6 sm:py-14">
        <div className="js-eyebrow"><span /> MG Visa · Career pathways</div>
        <h1 className="mt-5 text-3xl font-extrabold sm:text-5xl">Your next chapter.<br /><span className="js-hero-accent">Job Seeker Portal</span></h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 sm:text-base" style={{ color: "var(--color-text-muted)" }}>Explore your options in Germany, Austria and Sweden. Check the requirements, calculate your points and plan your proof of funds.</p>
      </div>
    </section>

    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-bold">Choose your destination</h2><span className="text-xs" style={{ color: "var(--color-text-muted)" }}>03 countries · 04 pathways</span></div>
      <div className="js-destinations" role="group" aria-label="Destination">
        {(["germany", "austria", "sweden"] as const).map(country => {
          const active = route === country || (route === "training" && country === "germany");
          return <button type="button" key={country} onClick={() => selectRoute(country)} aria-pressed={active} className={`js-country ${active ? "is-active" : ""}`}><span className="js-country-code">{JOB_SEEKER_PROGRAMS[country].code}</span><span><strong>{JOB_SEEKER_PROGRAMS[country].country}</strong><small>{country === "germany" ? "Opportunity Card & training" : country === "austria" ? "Very highly qualified workers" : "Work or start a business"}</small></span><span className="js-country-indicator" aria-hidden="true">{active ? "✓" : "↗"}</span></button>;
        })}
      </div>

      {isGerman && <div className="js-pathways" role="group" aria-label="German pathway"><button type="button" aria-pressed={route === "germany"} onClick={() => selectRoute("germany")}>Opportunity Card</button><button type="button" aria-pressed={route === "training"} onClick={() => selectRoute("training")}>Vocational Training Search</button></div>}

      <div className="js-layout">
        <div className="min-w-0">
          <form onSubmit={submit} className="js-form">
            <div className="js-form-heading"><div className="js-kicker">{program.country} / Eligibility check</div><h2>{program.title}</h2></div>

            {route === "germany" && <>
              <Section number="01" title="Your qualification">
                <div className="sm:col-span-2">{select("qualification", "Qualification status", [["recognised", "German qualification / fully recognised in Germany"], ["foreign", "State-recognised foreign qualification"], ["none", "No qualifying qualification yet"]], "For foreign vocational qualifications: at least two years of training. Recognition must be evidenced.")}</div>
                <div className="sm:col-span-2 js-note">{isDirect ? "With full German recognition, the points route and formal language requirement do not apply. Funding and other visa requirements still apply." : "The points route requires a qualifying qualification, German A1 or English B2, and at least 6 points."}</div>
              </Section>
              {!isDirect && <>
                <Section number="02" title="Age, experience & language">
                  {numeric("age", "Age", 18, 100)}
                  {select("experience", "Relevant experience after qualification", [["none", "Less / does not meet these periods"], ["two", "2+ years within the last 5 years · 2 points"], ["five", "5+ years within the last 7 years · 3 points"]])}
                  {select("german", "German level", LANGUAGES)}{select("english", "English level", LANGUAGES)}
                </Section>
                <Section number="03" title="Additional points">
                  {yesNo("partial", "Official partial recognition?", "An authority has issued partial equivalence or required compensatory measures · 4 points.")}
                  {yesNo("shortage", "Qualification in a shortage occupation?", "Confirm against the official shortage list · 1 point.")}
                  {yesNo("previousStay", "Previous qualifying stay in Germany?", "6 continuous legal months in the last 5 years, excluding tourism or visits · 1 point.")}
                  {yesNo("partner", "Eligible accompanying spouse / partner?", "Your partner also qualifies for and applies for an Opportunity Card with you · 1 point.")}
                </Section>
              </>}
            </>}

            {route === "austria" && <>
              <Section number="01" title="Qualifications & skills">
                {select("education", "Highest qualifying education", [["none", "None of these"], ["degree", "Higher education, 4+ years · 20 points"], ["mint", "MINT degree, 4+ years · 30 points"], ["phd", "PhD / habilitation · 40 points"]])}
                {select("salary", "Previous year's gross senior management salary", [["none", "Not applicable / below €50,000"], ["lower", "€50,000–€60,000 · 20 points"], ["middle", "Over €60,000–€70,000 · 25 points"], ["upper", "Over €70,000 · 30 points"]], "Only qualifying listed companies or companies with a positive Austrian foreign trade office report.")}
                {yesNo("research", "Documented research / innovation?", "Qualifying publications or patent applications · 20 points.")}
                {yesNo("awards", "Recognised awards?", "Documented recognised prizes · 20 points.")}
                <p className="js-note sm:col-span-2">Qualifications, salary, research and awards share a combined maximum of 40 points.</p>
              </Section>
              <Section number="02" title="Age & relevant experience">
                {numeric("age", "Age", 18, 100, 1, "Under 35: 20 · under 40: 15 · under 45: 10 points.")}
                {numeric("years", "Relevant work experience (years)", 0, 60, 0.5, "1 point per completed half-year (2 per year); category maximum 20.")}
                {yesNo("austrianExperience", "At least 6 months of work in Austria?", "10 additional points within the experience cap.")}
                {select("austrianStudies", "Studies in Austria", [["none", "None"], ["half", "Second diploma stage / half required ECTS · 5"], ["completed", "Completed diploma or bachelor's + master's · 10"]])}
              </Section>
              <Section number="03" title="Language skills">
                {select("german", "German level", LANGUAGES)}{select("english", "English level", LANGUAGES)}
                {yesNo("french", "French B1 or higher?", "5 points.")}{yesNo("spanish", "Spanish B1 or higher?", "5 points.")}{yesNo("bcs", "Bosnian, Croatian or Serbian B1+?", "5 points for this language group.")}
                <p className="js-note sm:col-span-2">German / English: A1 = 5, A2+ = 10. All language points combined are capped at 10.</p>
              </Section>
            </>}

            {route === "sweden" && <Section number="01" title="Education & application">
              {yesNo("secondCycle", "Completed second-cycle qualification?", "Qualifying master's, professional second-cycle degree or PhD; a bachelor's alone does not meet this requirement.")}
              {yesNo("outsideSweden", "Applying from outside Sweden?")}
              <div className="sm:col-span-2">{yesNo("purpose", "Will you seek work or explore starting a business?")}</div>
            </Section>}

            {route === "training" && <Section number="01" title="Training search requirements">
              {numeric("age", "Age", 18, 100, 1, "You must be under 35 at application. This checker covers adult applicants.")}
              {select("german", "German level", LANGUAGES, "B1 or higher is required.")}
              <div className="sm:col-span-2">{yesNo("school", "Qualifying school-leaving certificate?", "Must grant university access in Germany or your home country (including Egypt), or be a qualification from a German school abroad.")}</div>
            </Section>}

            <Section number={route === "sweden" || route === "training" || isDirect ? "02" : "04"} title="Stay & supporting documents">
              {route !== "austria" && <Field id={`${route}-months`} label="Planned stay" hint={`Maximum ${program.months} months; the authority decides the permitted duration.`}><select id={`${route}-months`} name="months" value={months} onChange={event => update("months", event.target.value)} aria-describedby={`${route}-months-hint`}>{Array.from({ length: program.months }, (_, index) => index + 1).map(value => <option key={value} value={value}>{value} {value === 1 ? "month" : "months"}</option>)}</select></Field>}
              {yesNo("passport", "Valid passport for your stay?")}
              {yesNo("insurance", "Health insurance for your full stay?")}
              {route === "austria" && yesNo("accommodation", "Proof of accommodation in Austria?")}
              <div className="sm:col-span-2">{yesNo("funding", route === "austria" ? "Sufficient funds confirmed with the consulate?" : `Can you document ${formatFunding(funding.amount, program.currency)} for this stay?`, route === "austria" ? "€7,850.34 is a client-provided planning estimate. Ask the competent consulate to confirm the amount for your circumstances." : route === "sweden" ? "Bank assets plus money for the return journey. Insurance and application fees are additional." : "Blocked account or an accepted declaration of commitment. The figure shows the full monthly funding requirement before any accepted alternative evidence.")}</div>
            </Section>

            <div className="js-form-actions"><p>Answers are used only for this check. Nothing is submitted to immigration authorities.</p><div className="flex flex-wrap gap-3"><button type="submit" className="js-primary">Check my eligibility <span aria-hidden="true">→</span></button><button type="button" className="js-reset" onClick={() => { setForms(previous => ({ ...previous, [route]: {} })); setShowResult(false); }}>Reset</button></div></div>
          </form>

          {result && <section id="job-seeker-result" className="js-result scroll-mt-40" tabIndex={-1} aria-label="Eligibility result" aria-live="polite" aria-atomic="true">
            <div className="js-kicker">Your preliminary assessment</div>
            <h2>{result.meetsCriteria ? "You meet the checked criteria" : "Requirements still to address"}</h2>
            {result.total !== null && <p className="js-score">{result.total}<span> / {route === "austria" ? "100" : `${result.threshold} required`} points</span></p>}
            {result.direct && <p className="mt-3 text-sm">Recognised qualification pathway: no points test required.</p>}
            {result.breakdown.length > 0 && <dl className="js-breakdown">{result.breakdown.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.points}</dd></div>)}</dl>}
            {result.issues.length > 0 && <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6">{result.issues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
            <p className="js-note mt-5">This is an initial check based on your answers, not a visa decision. Documents, recognition and the final assessment remain with the competent authorities.</p>
          </section>}
        </div>

        <aside className="js-sidebar" aria-label="Pathway information">
          <section className="js-funding"><div className="js-kicker">Plan your stay</div><p className="js-duration">{program.duration}</p><div className="js-funding-divider" /><p className="text-xs font-semibold uppercase tracking-wider">{funding.estimated ? "Planning estimate" : "Proof of funds"}</p><p className="js-amount">{formatFunding(funding.amount, program.currency)}</p><p className="mt-2 text-xs leading-6">{funding.estimated ? "For a 6-month stay. Client-provided estimate; confirm the current requirement with your consulate." : `${formatFunding(program.monthly!, program.currency)} × ${funding.months} ${funding.months === 1 ? "month" : "months"}`}</p><EgpEquivalent amount={funding.amount} currency={program.currency} />{route === "sweden" && <p className="mt-3 text-xs leading-5">Plus your return journey. A 6-month stay requires SEK 78,000; 9 months requires SEK 117,000.</p>}{isGerman && <p className="mt-3 text-xs leading-5">2026 monthly amount. A declaration of commitment may be accepted instead of a blocked account.</p>}</section>

          <section className="js-info-card"><h3>Before you apply</h3><ul className="js-checklist">
            {(route === "germany" ? ["Confirm qualification recognition", "Prepare language evidence for the points route", "Document each claimed point", "Arrange funds and insurance"] : route === "austria" ? ["Reach at least 70 out of 100 points", "Prepare degree and work certificates", "Document housing, funds and insurance", "Submit through the Austrian representation"] : route === "sweden" ? ["Prepare degree and transcripts", "Sign consent for education verification", "Provide bank and insurance documents", "Apply from outside Sweden"] : ["Be under 35", "Provide German B1 evidence", "Prepare qualifying school certificate", "Arrange funds for the requested stay"]).map(item => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
          </ul></section>

          <section className="js-info-card"><h3>Official resources</h3><OfficialLink href={JOB_SEEKER_SOURCES[route]}>Requirements & application</OfficialLink>{(isGerman || route === "austria") && <OfficialLink href={JOB_SEEKER_SOURCES.anabin}>Anabin · institution recognition</OfficialLink>}{route === "germany" && <p className="mt-3 text-xs leading-6" style={{ color: "var(--color-text-muted)" }}>Check both the institution and qualification. An institution listing alone does not establish full degree recognition.</p>}<p className="mt-5 text-xs" style={{ color: "var(--color-text-muted)" }}>Sources checked · 28 October 2026</p></section>
          <p className="px-1 text-xs leading-6" style={{ color: "var(--color-text-muted)" }}>For applicants from outside the EU/EEA. Other nationality or residence rules may apply. Confirm current requirements before submitting.</p>
        </aside>
      </div>
    </main>
  </>;
}
