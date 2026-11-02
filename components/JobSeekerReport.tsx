"use client";

import { useEffect, useRef, useState } from "react";
import ClientReport, { printReport as printClientReport, type ClientReportProps } from "@/components/ClientReport";
import type { EgpRates } from "@/lib/exchange-rates";
import { formatFunding, fundingFor, JOB_SEEKER_PROGRAMS, type JobSeekerAnswers, type JobSeekerAssessment, type JobSeekerRoute } from "@/lib/job-seeker";
import { jobSeekerReportRows } from "@/lib/job-seeker-report";

interface ReportProps { route: JobSeekerRoute; form: JobSeekerAnswers; result: JobSeekerAssessment; rates: EgpRates | null }
interface PreparedReport extends ReportProps { name: string; id: string; date: string; asOf: number }

const currencyStatus = { empty: "Balance not supplied", invalid: "Invalid balance", "rates-unavailable": "Current currency rate unavailable", covered: "Funds sufficient", shortfall: "Funding shortfall" };
const displayStatus = (value?: string) => ({ hplus: "H+ — recognised institution", conditional: "Conditional recognition — review required", negative: "Negative recognition record", equivalent: "Comparable / equivalent in Anabin", partial: "Conditions apply — individual review needed", unknown: "Recognition not confirmed" } as Record<string, string>)[value || "unknown"] || "Recognition not confirmed";

function ReportContent({ route, form, result }: ReportProps) {
  const rows = jobSeekerReportRows(route, form, result);

  return <>
    <section className="js-report-overview" aria-label="Assessment summary">
      <div><h3>{result.meetsCriteria ? "Your profile meets the selected checks" : "Checks still to address"}</h3><p>{result.direct ? "Recognised-qualification route" : result.total !== null ? "Points route · simplified MG screening" : "Requirements-based MG screening"}</p></div>
      {result.total !== null && <div className="js-report-total"><strong>{result.total}</strong><span>points earned{result.threshold !== null ? ` · ${result.threshold} required` : ""}</span></div>}
    </section>

    <section className="js-report-section" aria-labelledby="job-report-breakdown">
      <h3 id="job-report-breakdown">{result.total !== null ? "Detailed points breakdown" : "Requirements reviewed"}</h3>
      <table className="js-report-table"><caption className="sr-only">Selected answers and points earned in each category</caption><thead><tr><th scope="col">Category</th><th scope="col">Your answer</th><th scope="col" className="js-report-points">{result.total !== null ? "Points" : "Scoring"}</th></tr></thead><tbody>
        {rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th><td><strong>{row.answer}</strong></td><td className="js-report-points">{row.points === null ? "No points" : <><strong>{row.points}</strong><span> / {row.maximum}</span></>}</td></tr>)}
      </tbody>{result.total !== null && <tfoot><tr><th scope="row" colSpan={2}>Total points earned</th><td className="js-report-points"><strong>{result.total}</strong></td></tr></tfoot>}</table>
      {result.direct && <p className="js-report-note">The selected records show an H+ university and a comparable degree explicitly linked to it. The recognised-qualification route has no official points threshold; the points above describe your profile.</p>}
      {route === "austria" && <p className="js-report-note">The MG screening includes only the categories shown above. Salary and Austrian-study points are excluded.</p>}
    </section>

    {result.issues.length > 0 && <section className="js-report-section js-report-attention" aria-label="Items requiring attention"><h3>Items requiring attention</h3><ul className="js-report-issues">{result.issues.map(issue => <li key={issue}>{issue}</li>)}</ul></section>}
  </>;
}

const routeText = (result: JobSeekerAssessment) => result.direct ? "Recognised-qualification route" : result.total !== null ? "Points route · simplified MG screening" : "Requirements-based MG screening";

// Print layout for the shared client summary, built from the snapshot taken when the PDF is requested.
function printableReport({ route, form, result, rates, name, id, date, asOf }: PreparedReport): ClientReportProps {
  const program = JOB_SEEKER_PROGRAMS[route];
  const funding = fundingFor(route, Number(form.months));
  const rows = jobSeekerReportRows(route, form, result);
  const funds = result.funds;
  const hasRate = rates && Number.isFinite(Date.parse(rates.updatedAt)) && asOf - Date.parse(rates.updatedAt) <= 48 * 60 * 60 * 1000;
  const numberText = (value: number | null) => value === null ? "Unavailable" : formatFunding(value, funds.currency);
  const scored = rows.filter(row => row.points !== null && row.maximum !== null);
  const scaleMax = scored.reduce((sum, row) => sum + (row.maximum ?? 0), 0);
  const fundsResult = `${currencyStatus[funds.status]}${funds.shortfall !== null && funds.shortfall > 0 ? ` · ${numberText(funds.shortfall)} short` : ""}`;

  return {
    kind: "job-seeker",
    programme: `${program.country} · ${program.title}`,
    title: "Job Seeker Eligibility Assessment",
    clientName: name,
    date,
    reference: id,
    score: result.total,
    scoreContext: result.threshold !== null ? `Points earned · ${result.threshold} required` : "Points earned · no official threshold on this route",
    scale: scaleMax > 0 ? { max: scaleMax, endLabel: String(scaleMax), marks: result.threshold !== null ? [{ value: result.threshold, label: `Required · ${result.threshold}` }] : [] } : undefined,
    status: result.meetsCriteria
      ? { label: "Meets the selected checks", color: "var(--color-strong)", description: `${routeText(result)}. The profile meets every check in this MG screening.` }
      : { label: "Checks still to address", color: "var(--color-moderate)", description: `${routeText(result)}. Some checks are not yet met; see the items requiring attention.` },
    facts: [
      { label: "Programme", value: `${program.country} · ${program.title}` },
      { label: "Assessment route", value: routeText(result) },
      ...(route === "germany" ? [{ label: "University", value: form.university || "Not selected" }] : []),
      { label: "Stay duration", value: `${funding.months} months` },
      { label: "Proof of funds", value: fundsResult },
    ],
    composition: scored.length > 1 ? scored.map(row => ({ label: row.label, earned: row.points ?? 0, max: row.maximum ?? 0 })) : [],
    attention: result.issues,
    detailsHeading: result.total !== null ? "Detailed points breakdown" : "Requirements reviewed",
    sections: [{
      key: "A",
      title: result.total !== null ? "Points assessment" : "Screening requirements",
      caption: routeText(result),
      rows: rows.map(row => ({ label: row.label, claim: row.answer, note: row.explanation, earned: row.points, max: row.maximum ?? undefined, pointsText: "No points" })),
    }],
    total: result.total !== null ? { label: "Total points earned", value: String(result.total), context: result.threshold !== null ? `points · ${result.threshold} required` : "points" } : undefined,
    panels: [
      ...(route === "germany" ? [{
        title: "University & degree recognition",
        facts: [
          { label: "University", value: form.university || "Not selected" },
          { label: "Institution status", value: displayStatus(form.institutionStatus) },
          { label: "Degree / specialisation", value: form.degree || "Not selected" },
          { label: "Degree status", value: displayStatus(form.degreeStatus) },
          { label: "University association", value: form.anabinDegreeAssociation === "institution" ? "Degree explicitly linked to the selected university" : "University link unconfirmed — review required" },
        ],
        notes: ["Source: Anabin. These are the records selected for this assessment; the exact qualification and supporting documents still need review."],
      }] : []),
      {
        title: "Bank statement & proof of funds",
        facts: [
          { label: "Stay duration", value: `${funding.months} months` },
          { label: funding.estimated ? "Planning estimate" : "Required funding", value: formatFunding(funding.amount, program.currency) },
          { label: "Available bank balance", value: numberText(funds.balance) },
          { label: "Required in balance currency", value: numberText(funds.required) },
          { label: "Funding result", value: fundsResult },
          ...(hasRate && rates ? [
            { label: "Required funding in EGP", value: `≈ ${formatFunding(Math.ceil(funding.amount * rates.rates[program.currency] * 100 - 1e-7) / 100, "EGP")}` },
            { label: "Exchange rate used", value: `1 ${program.currency} = ${rates.rates[program.currency].toFixed(4)} EGP` },
            { label: "Rate updated (ExchangeRate-API)", value: `${new Date(rates.updatedAt).toLocaleString("en-GB", { timeZone: "Africa/Cairo", dateStyle: "medium", timeStyle: "short" })} (Cairo)` },
          ] : [{ label: "EGP conversion", value: "A current exchange rate is unavailable. No EGP equivalent is reported." }]),
        ],
        notes: [
          ...(funding.estimated ? ["Austria’s amount is a client-provided planning estimate and requires consular confirmation."] : []),
          ...(route === "sweden" ? ["Return journey costs are additional to the living-cost requirement shown above."] : []),
        ],
      },
    ],
    notes: [
      "This screening is indicative only. It follows MG’s simplified criteria for the selected programme and is not the full official assessment. It does not constitute legal or immigration advice, or guarantee a visa decision.",
      ...(result.direct ? ["The selected records show an H+ university and a comparable degree explicitly linked to it. The recognised-qualification route has no official points threshold; the points describe the profile."] : []),
      ...(route === "austria" ? ["The MG screening includes only the categories shown. Salary and Austrian-study points are excluded."] : []),
      "Results reflect the information provided on the date above. For a full review of your documents, contact a licensed MG Visa advisor.",
    ],
  };
}

export default function JobSeekerReport(props: ReportProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [prepared, setPrepared] = useState<PreparedReport | null>(null);

  useEffect(() => {
    if (!prepared) return;
    const previousTitle = document.title;
    document.title = `MG Job Seeker Assessment - ${prepared.id}`;
    const restore = () => { document.title = previousTitle; setPrepared(null); };
    window.addEventListener("afterprint", restore, { once: true });
    // Wait for the separate print document to commit before invoking the browser dialog.
    let secondFrame = 0;
    const frame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(() => printClientReport("job-seeker", 0)); });
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
      <ReportContent {...props} />
      <div className="js-report-actions"><button type="button" className="js-primary" onClick={() => dialog.current?.showModal()}>Generate PDF report</button></div>
    </section>
    <dialog ref={dialog} className="report-dialog" aria-labelledby="job-report-dialog-title"><form onSubmit={printReport} className="p-6 sm:p-8">
      <h2 id="job-report-dialog-title" className="text-xl font-bold mb-2">Generate PDF report</h2><p className="text-sm leading-6 mb-5">Enter the client’s name for the MG assessment report.</p>
      <div className="js-field"><label htmlFor="job-report-client">Client name</label><input id="job-report-client" autoComplete="name" required maxLength={150} value={name} onChange={event => setName(event.target.value)} placeholder="e.g. John Doe" /></div>
      <div className="flex flex-wrap gap-3 mt-6"><button type="button" className="js-reset" onClick={() => dialog.current?.close()}>Cancel</button><button type="submit" className="js-primary">Print / Save as PDF</button></div>
    </form></dialog>
    {prepared && <ClientReport {...printableReport(prepared)} />}
  </>;
}
