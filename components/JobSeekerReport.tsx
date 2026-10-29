"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import type { EgpRates } from "@/lib/exchange-rates";
import { formatFunding, fundingFor, JOB_SEEKER_PROGRAMS, type JobSeekerAnswers, type JobSeekerAssessment, type JobSeekerRoute } from "@/lib/job-seeker";
import { jobSeekerReportRows } from "@/lib/job-seeker-report";

interface ReportProps { route: JobSeekerRoute; form: JobSeekerAnswers; result: JobSeekerAssessment; rates: EgpRates | null }
interface PreparedReport extends ReportProps { name: string; id: string; date: string; asOf: number }

const currencyStatus = { empty: "Balance not supplied", invalid: "Invalid balance", "rates-unavailable": "Current currency rate unavailable", covered: "Funds sufficient", shortfall: "Funding shortfall" };
const displayStatus = (value?: string) => ({ hplus: "H+ — recognised institution", conditional: "Conditional recognition — review required", negative: "Negative recognition record", equivalent: "Comparable / equivalent in Anabin", partial: "Conditions apply — individual review needed", unknown: "Recognition not confirmed" } as Record<string, string>)[value || "unknown"] || "Recognition not confirmed";

function ReportContent({ route, form, result, rates, name, id, date, asOf, printVersion = false }: ReportProps & { name?: string; id?: string; date?: string; asOf: number; printVersion?: boolean }) {
  const program = JOB_SEEKER_PROGRAMS[route];
  const funding = fundingFor(route, Number(form.months));
  const rows = jobSeekerReportRows(route, form, result);
  const funds = result.funds;
  const hasRate = rates && Number.isFinite(Date.parse(rates.updatedAt)) && asOf - Date.parse(rates.updatedAt) <= 48 * 60 * 60 * 1000;
  const numberText = (value: number | null) => value === null ? "Unavailable" : formatFunding(value, funds.currency);

  return <>
    {printVersion && <header className="js-report-letterhead">
      <div><Image src="/Logo W.png" alt="MG Visa" width={112} height={52} unoptimized loading="eager" /><p className="js-report-company">MG International Visa Consultancy</p><p>Cairo | Dubai | Zayed</p><p>Info@mg-visa.com</p></div>
      <div className="js-report-prepared"><h2>Assessment Report</h2><p>{program.country} · {program.title}</p><dl><div><dt>Prepared for</dt><dd>{name || "Client profile"}</dd></div><div><dt>Date</dt><dd>{date || "Current assessment"}</dd></div><div><dt>Report ID</dt><dd>{id || "Assigned when generated"}</dd></div></dl></div>
    </header>}

    <section className="js-report-overview" aria-label="Assessment summary">
      <div><h3>{result.meetsCriteria ? "Your profile meets the selected checks" : "Checks still to address"}</h3><p>{result.direct ? "Recognised-qualification route" : result.total !== null ? "Points route · simplified MG screening" : "Requirements-based MG screening"}</p></div>
      {result.total !== null && <div className="js-report-total"><strong>{result.total}</strong><span>points earned{result.threshold !== null ? ` · ${result.threshold} required` : ""}</span></div>}
    </section>

    <section className="js-report-section" aria-labelledby={`job-report-breakdown${id ? "-print" : ""}`}>
      <h3 id={`job-report-breakdown${id ? "-print" : ""}`}>{result.total !== null ? "Detailed points breakdown" : "Requirements reviewed"}</h3>
      <table className="js-report-table"><caption className="sr-only">Selected answers and points earned in each category</caption><thead><tr><th scope="col">Category</th><th scope="col">Your answer</th><th scope="col">{result.total !== null ? "Points" : "Scoring"}</th></tr></thead><tbody>
        {rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td><strong>{row.answer}</strong></td><td className="js-report-points">{row.points === null ? "No points" : <><strong>{row.points}</strong><span> / {row.maximum}</span></>}</td></tr>)}
      </tbody>{result.total !== null && <tfoot><tr><th scope="row" colSpan={2}>Total points earned</th><td className="js-report-points"><strong>{result.total}</strong></td></tr></tfoot>}</table>
      {result.direct && <p className="js-report-note">The selected records show an H+ university and a comparable degree explicitly linked to it. The recognised-qualification route has no official points threshold; the points above describe your profile.</p>}
      {route === "austria" && <p className="js-report-note">The MG screening includes only the categories shown above. Salary and Austrian-study points are excluded.</p>}
    </section>

    {printVersion && route === "germany" && <section className="js-report-section"><h3>University & degree recognition</h3><dl className="js-report-facts">
      <div><dt>University</dt><dd>{form.university || "Not selected"}</dd></div><div><dt>Institution status</dt><dd>{displayStatus(form.institutionStatus)}</dd></div>
      <div><dt>Degree / specialisation</dt><dd>{form.degree || "Not selected"}</dd></div><div><dt>Degree status</dt><dd>{displayStatus(form.degreeStatus)}</dd></div>
      <div><dt>University association</dt><dd>{form.anabinDegreeAssociation === "institution" ? "Degree explicitly linked to the selected university" : "University link unconfirmed — review required"}</dd></div>
    </dl><p className="js-report-note">Source: Anabin. These are the records selected for this assessment; the exact qualification and supporting documents still need review.</p></section>}

    {printVersion && <section className="js-report-section"><h3>Bank statement & proof of funds</h3><dl className="js-report-facts">
      <div><dt>Stay duration</dt><dd>{funding.months} months</dd></div>
      <div><dt>{funding.estimated ? "Planning estimate" : "Required funding"}</dt><dd>{formatFunding(funding.amount, program.currency)}</dd></div>
      <div><dt>Available bank balance</dt><dd>{numberText(funds.balance)}</dd></div><div><dt>Required in balance currency</dt><dd>{numberText(funds.required)}</dd></div>
      <div><dt>Funding result</dt><dd>{currencyStatus[funds.status]}{funds.shortfall !== null && funds.shortfall > 0 ? ` · ${numberText(funds.shortfall)} short` : ""}</dd></div>
      {hasRate && rates && <><div><dt>Required funding in EGP</dt><dd>≈ {formatFunding(Math.ceil(funding.amount * rates.rates[program.currency] * 100 - 1e-7) / 100, "EGP")}</dd></div><div><dt>Exchange rate used</dt><dd>1 {program.currency} = {rates.rates[program.currency].toFixed(4)} EGP</dd></div><div><dt>Rate updated (ExchangeRate-API)</dt><dd>{new Date(rates.updatedAt).toLocaleString("en-GB", { timeZone: "Africa/Cairo", dateStyle: "medium", timeStyle: "short" })} (Cairo)</dd></div></>}
      {!hasRate && <div><dt>EGP conversion</dt><dd>A current exchange rate is unavailable. No EGP equivalent is reported.</dd></div>}
    </dl>{funding.estimated && <p className="js-report-note">Austria’s amount is a client-provided planning estimate and requires consular confirmation.</p>}{route === "sweden" && <p className="js-report-note">Return journey costs are additional to the living-cost requirement shown above.</p>}</section>}

    {result.issues.length > 0 && <section className="js-report-section js-report-attention" aria-label="Items requiring attention"><h3>Items requiring attention</h3><ul className="js-report-issues">{result.issues.map(issue => <li key={issue}>{issue}</li>)}</ul></section>}
  </>;
}

export default function JobSeekerReport(props: ReportProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [prepared, setPrepared] = useState<PreparedReport | null>(null);
  const [assessedAt] = useState(() => Date.now());

  useEffect(() => {
    if (!prepared) return;
    const previousTitle = document.title;
    document.title = `MG Job Seeker Assessment - ${prepared.id}`;
    const restore = () => { document.title = previousTitle; setPrepared(null); };
    window.addEventListener("afterprint", restore, { once: true });
    // Wait for the separate print document to commit before invoking the browser dialog.
    let secondFrame = 0;
    const frame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(() => window.print()); });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(secondFrame); window.removeEventListener("afterprint", restore); document.title = previousTitle; };
  }, [prepared]);

  function printReport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;
    dialog.current?.close();
    setPrepared({ ...props, form: { ...props.form }, name: name.trim(), id: `MG-JS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, asOf: Date.now(), date: new Date().toLocaleString("en-GB", { timeZone: "Africa/Cairo", dateStyle: "long", timeStyle: "short" }) + " (Cairo)" });
  }

  return <>
    <section id="job-seeker-result" className="js-result js-report scroll-mt-40" tabIndex={-1} aria-label="Eligibility result">
      <ReportContent {...props} asOf={assessedAt} />
      <div className="js-report-actions"><button type="button" className="js-primary" onClick={() => dialog.current?.showModal()}>Generate PDF report</button></div>
    </section>
    <dialog ref={dialog} className="report-dialog" aria-labelledby="job-report-dialog-title"><form onSubmit={printReport} className="p-6 sm:p-8">
      <h2 id="job-report-dialog-title" className="text-xl font-bold mb-2">Generate PDF report</h2><p className="text-sm leading-6 mb-5">Enter the client’s name for the MG assessment report.</p>
      <div className="js-field"><label htmlFor="job-report-client">Client name</label><input id="job-report-client" autoComplete="name" required maxLength={150} value={name} onChange={event => setName(event.target.value)} placeholder="e.g. John Doe" /></div>
      <div className="flex flex-wrap gap-3 mt-6"><button type="button" className="js-reset" onClick={() => dialog.current?.close()}>Cancel</button><button type="submit" className="js-primary">Print / Save as PDF</button></div>
    </form></dialog>
    {prepared && createPortal(<article id="printable-job-seeker" className="js-report" aria-label="Prepared Job Seeker report"><div className="pdf-watermark"><Image src="/Logo W.png" alt="" width={320} height={320} unoptimized loading="eager" className="invert" /></div><ReportContent {...prepared} printVersion /></article>, document.body)}
  </>;
}
