"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import EgpEquivalent from "@/components/EgpEquivalent";
import useEgpRates from "@/components/useEgpRates";
import AnabinQualificationSearch from "@/components/AnabinQualificationSearch";
import JobSeekerReport from "@/components/JobSeekerReport";
import {
  assessJobSeeker, checkBankFunds, fundingFor, formatFunding,
  JOB_SEEKER_PROGRAMS,
  type JobSeekerRoute, type JobSeekerAnswers, type BankFundsCheck,
} from "@/lib/job-seeker";

const LEVELS = [["none", "Below A1 / no certificate"], ["a1", "A1"], ["a2", "A2"], ["b1", "B1"], ["b2", "B2"], ["c1", "C1"], ["c2", "C2"]] as const;
const YES_NO = [["yes", "Yes"], ["no", "No / not yet"]] as const;
const EMPTY_FORMS: Record<JobSeekerRoute, JobSeekerAnswers> = { germany: {}, austria: {}, sweden: {}, training: {} };

function Field({ id, label, hint, hintAfter = false, children }: { id: string; label: string; hint?: string; hintAfter?: boolean; children: ReactNode }) {
  const description = hint ? <p id={`${id}-hint`}>{hint}</p> : null;
  return <div className="js-field"><label htmlFor={id}>{label}</label>{!hintAfter && description}{children}{hintAfter && description}</div>;
}

function Section({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <section id={`job-section-${number}`} tabIndex={-1} aria-labelledby={`job-heading-${number}`} className="js-section">
    <h3 id={`job-heading-${number}`}>{title}</h3><div className="grid gap-5 sm:grid-cols-2">{children}</div>
  </section>;
}

function FundsStatus({ funds, months }: { funds: BankFundsCheck; months: number }) {
  return <div className="js-bank-status" data-state={funds.status} role="status" aria-live="polite" aria-atomic="true">
    {funds.status === "empty" && <p>Enter your available balance to check {months} months of funding.</p>}
    {funds.status === "invalid" && <p>Enter a non-negative amount, such as 800,000 or 800000.50.</p>}
    {funds.status === "rates-unavailable" && <p>Waiting for a current exchange rate. Retry the rate below, or enter the balance in the required currency.</p>}
    {funds.status === "covered" && <><strong>Funds sufficient for {months} months</strong><p>Required: {formatFunding(funds.required!, funds.currency)}. Your balance covers this amount.</p></>}
    {funds.status === "shortfall" && <><strong>Funds do not cover {months} months</strong><p>Required: {formatFunding(funds.required!, funds.currency)}. Shortfall: {formatFunding(funds.shortfall!, funds.currency)}.</p></>}
  </div>;
}

export default function JobSeekerPortal() {
  const [route, setRoute] = useState<JobSeekerRoute>("germany");
  const [forms, setForms] = useState(EMPTY_FORMS);
  const [showResult, setShowResult] = useState(false);
  const fx = useEgpRates();
  const form = forms[route];
  const program = JOB_SEEKER_PROGRAMS[route];
  const funding = fundingFor(route, Number(form.months));
  const funds = checkBankFunds(route, form, fx.rates);
  const result = showResult ? assessJobSeeker(route, form, fx.rates) : null;
  const isGerman = route === "germany" || route === "training";
  const flexibleDuration = route === "sweden" || route === "training";

  function update(key: string, value: string) {
    setForms(previous => ({ ...previous, [route]: { ...previous[route], ...(key === "language" ? { languageLevel: "" } : {}), [key]: value } }));
    setShowResult(false);
  }
  function selectRoute(value: JobSeekerRoute) { setRoute(value); setShowResult(false); }
  function updateRecognition(patch: JobSeekerAnswers) {
    setForms(previous => ({ ...previous, germany: { ...previous.germany, ...patch } }));
    setShowResult(false);
  }
  function select(key: string, label: string, options: readonly (readonly [string, string])[], hint?: string) {
    const id = `${route}-${key}`;
    return <Field id={id} label={label} hint={hint} hintAfter={key === "language" || key === "languageLevel"}><select id={id} name={key} value={form[key] ?? ""} onChange={event => update(key, event.target.value)} required aria-describedby={hint ? `${id}-hint` : undefined}>
      <option value="" disabled>Select an answer</option>{options.map(([value, text]) => <option value={value} key={value}>{text}</option>)}
    </select></Field>;
  }
  function yesNo(key: string, label: string, hint?: string) { return select(key, label, YES_NO, hint); }
  function numeric(key: string, label: string, min: number, max: number, step = 1, hint?: string) {
    const id = `${route}-${key}`;
    return <Field id={id} label={label} hint={hint}><input id={id} name={key} type="number" inputMode={step === 1 ? "numeric" : "decimal"} min={min} max={max} step={step} required value={form[key] ?? ""} onChange={event => update(key, event.target.value)} aria-describedby={hint ? `${id}-hint` : undefined} placeholder={key === "age" ? "Age at application" : "e.g. 3.5"} /></Field>;
  }
  function bankBalance() {
    const id = `${route}-bankBalance`;
    return <div className="sm:col-span-2 js-bank-input">
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_150px]">
        <Field id={id} label="Available bank balance">
          <input id={id} name="bankBalance" type="text" inputMode="decimal" autoComplete="off" maxLength={24} required value={form.bankBalance ?? ""} onChange={event => update("bankBalance", event.target.value)} placeholder="e.g. 800,000" aria-invalid={funds.status === "invalid"} aria-describedby={`${id}-hint ${id}-note`} />
        </Field>
        <Field id={`${route}-bankCurrency`} label="Balance currency"><select id={`${route}-bankCurrency`} name="bankCurrency" value={form.bankCurrency || "EGP"} onChange={event => update("bankCurrency", event.target.value)}><option value="EGP">EGP</option><option value="EUR">EUR</option><option value="SEK">SEK</option></select></Field>
      </div>
      <p id={`${id}-hint`} className="js-bank-note">We check whether this covers {funding.months} months. Enter the amount shown on your bank statement.</p>
      <FundsStatus funds={funds} months={funding.months} />
      <p id={`${id}-note`} className="js-bank-note">Funding coverage only; this is not a visa approval.{route === "sweden" ? " Return travel is additional." : ""}{route === "austria" ? " Austria's amount is a planning estimate requiring consular confirmation." : ""}</p>
    </div>;
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setShowResult(true);
    requestAnimationFrame(() => {
      const element = document.getElementById("job-seeker-result");
      element?.focus({ preventScroll: true });
      element?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    });
  }

  return <>
    <section className="js-hero"><div className="mx-auto max-w-5xl px-4 py-11 text-center sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold sm:text-5xl">Job Seeker Portal</h1>
    </div></section>
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h2 className="mb-3 text-sm font-bold">Choose your destination</h2>
      <div className="js-destinations" role="group" aria-label="Destination">
        {(["germany", "austria", "sweden"] as const).map(country => {
          const active = route === country || (route === "training" && country === "germany");
          return <button type="button" key={country} onClick={() => selectRoute(country)} aria-pressed={active} className={`js-country ${active ? "is-active" : ""}`}>
            <span className="js-country-code">{JOB_SEEKER_PROGRAMS[country].code}</span><span><strong>{JOB_SEEKER_PROGRAMS[country].country}</strong><small>{country === "germany" ? "Opportunity Card & training" : country === "austria" ? "Very highly qualified workers" : "Work or start a business"}</small></span>
          </button>;
        })}
      </div>
      {isGerman && <div className="js-pathways" role="group" aria-label="German pathway"><button type="button" aria-pressed={route === "germany"} onClick={() => selectRoute("germany")}>Opportunity Card</button><button type="button" aria-pressed={route === "training"} onClick={() => selectRoute("training")}>Vocational Training Search</button></div>}

      <div className="js-layout"><div className="min-w-0">
        <form onSubmit={submit} className="js-form">
          <div className="js-form-heading"><h2>{program.title}</h2></div>
          {route === "germany" && <>
            <Section number="01" title="University & degree recognition">
              <AnabinQualificationSearch form={form} onChange={updateRecognition} />
            </Section>
            <Section number="02" title="Age, experience, language & bank balance">
              {numeric("age", "Age", 18, 100)}
              {select("experience", "Relevant experience after qualification", [["none", "Less than 2 qualifying years"], ["two", "2+ years within the last 5 years"], ["five", "5+ years within the last 7 years"]])}
              {select("language", "Language", [["german", "German"], ["english", "English"]], "Choose one language for this screening.")}
              {select("languageLevel", form.language === "english" ? "English level" : form.language === "german" ? "German level" : "Language level", LEVELS, form.language === "english" ? "B2 or higher is required for the points route." : undefined)}
              {bankBalance()}
            </Section>
          </>}
          {route === "training" && <Section number="01" title="Training search requirements">
            {numeric("age", "Age", 18, 100, 1, "You must be under 35. This screening covers adult applicants.")}
            {select("german", "German level", LEVELS, "B2 or higher is required for this MG screening.")}
            <div className="sm:col-span-2">{select("school", "School qualification", [["diploma", "Diploma"], ["secondary", "Secondary school"], ["none", "None"]], "The certificate's university-access equivalence must still be verified.")}</div>
            {bankBalance()}
          </Section>}
          {route === "sweden" && <Section number="01" title="Education, experience & bank balance">
            {yesNo("secondCycle", "Completed second-cycle qualification?", "A qualifying master's, second-cycle professional degree or PhD.")}
            {yesNo("outsideSweden", "Applying from outside Sweden?")}
            <div className="sm:col-span-2">{numeric("years", "Experience in the same field of study (years)", 0, 60, 0.5, "Enter 0 if none. Recorded for your profile; this does not create a separate official experience requirement.")}</div>
            {bankBalance()}
          </Section>}
          {route === "austria" && <>
            <Section number="01" title="Qualifications & skills">
              {select("education", "Highest qualifying education", [["none", "None of these"], ["degree", "Higher education, 4+ years"], ["mint", "MINT degree, 4+ years"], ["phd", "PhD / habilitation"]])}
              {yesNo("research", "Documented research / innovation?")}{yesNo("awards", "Recognised awards?")}
            </Section>
            <Section number="02" title="Age & relevant experience">
              {numeric("age", "Age", 18, 100)}{numeric("years", "Relevant work experience (years)", 0, 60, 0.5)}
              <div className="sm:col-span-2">{yesNo("austrianExperience", "At least 6 months of relevant work in Austria?")}</div>
            </Section>
            <Section number="03" title="Language & bank balance">
              {select("language", "Language", [["german", "German"], ["english", "English"], ["french", "French"], ["spanish", "Spanish"], ["bosnian", "Bosnian"], ["croatian", "Croatian"], ["serbian", "Serbian"]], "Choose one language only.")}
              {select("languageLevel", "Language level", LEVELS)}{bankBalance()}
            </Section>
          </>}
          <div className="js-form-actions"><p>This simplified MG screening covers the fields shown here. Nothing is submitted to an authority.</p><div className="flex flex-wrap gap-3">
            <button type="submit" className="js-primary">Calculate my assessment</button>
            <button type="button" className="js-reset" onClick={() => { setForms(previous => ({ ...previous, [route]: {} })); setShowResult(false); }}>Reset this pathway</button>
          </div></div>
        </form>
        {result && <JobSeekerReport key={route} route={route} form={form} result={result} rates={fx.rates} />}
      </div>
      <aside className="js-sidebar" aria-label="Pathway information">
        <section id="job-funding" tabIndex={-1} aria-label="Funding details" className="js-funding">
          <h3 className="text-sm font-semibold">{funding.estimated ? "Planning estimate" : "Proof of funds"}</h3>
          <p className="js-duration">{funding.months} months</p>
          {flexibleDuration && <fieldset className="js-duration-options"><legend>Choose stay duration</legend>{[6, 9].map(month => <label key={month}><input type="radio" name={`${route}-duration`} value={month} checked={funding.months === month} onChange={() => update("months", String(month))} /><span>{month} months</span></label>)}</fieldset>}
          <div className="js-funding-divider" /><p className="js-amount">{formatFunding(funding.amount, program.currency)}</p>
          <p className="mt-2 text-xs leading-6">{funding.estimated ? "Client-provided estimate. Confirm the current requirement with your consulate." : `${formatFunding(program.monthly!, program.currency)} × ${funding.months} months`}</p>
          <EgpEquivalent amount={funding.amount} currency={program.currency} rates={fx.rates} error={fx.error} onRetry={fx.refresh} />
          {route === "sweden" && <p className="mt-3 text-xs leading-5">Return journey costs are additional.</p>}
        </section>
      </aside></div>
    </main>
  </>;
}
