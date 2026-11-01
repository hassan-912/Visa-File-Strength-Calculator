"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import "./immigration-report.css";

// ─────────────────────────────────────────────────────────────────
// Shared printable A4 client summary for the Canada CRS and
// Australia GSM calculators. Presentation only: every score passed
// in comes from the calculators in lib/.
// ─────────────────────────────────────────────────────────────────

export interface ReportRow {
  label: string;
  claim: string;
  earned: number;
  /** Omitted for adjustment rows such as a points cap. */
  max?: number;
}

export interface ReportSection {
  key: string;
  title: string;
  caption: string;
  rows: ReportRow[];
  /** Overrides the summed row maximum when the section is capped. */
  max?: number;
}

export interface ReportStatus {
  label: string;
  color: string;
  description: string;
}

export type ReportKind = "crs" | "gsm";

export interface ImmigrationReportProps {
  kind: ReportKind;
  programme: string;
  title: string;
  clientName: string;
  date: string;
  reference: string;
  score: number;
  scoreContext: string;
  /** The visual scale may stop short of the true maximum so bands stay legible. */
  scale: { max: number; endLabel: string; marks: Array<{ value: number; label: string }> };
  status: ReportStatus;
  facts: Array<{ label: string; value: string }>;
  sections: ReportSection[];
  totalLabel: string;
  totalMaxLabel: string;
  notes: string[];
}

const fmt = (n: number) => n.toLocaleString("en-US");
const pct = (earned: number, max: number) => (max > 0 ? Math.max(0, Math.min(100, (earned / max) * 100)) : 0);

export function sectionTotals(section: ReportSection) {
  const earned = section.rows.reduce((sum, row) => sum + row.earned, 0);
  const max = section.max ?? section.rows.reduce((sum, row) => sum + (row.max ?? 0), 0);
  return { earned, max };
}

/** Short, human-checkable reference, e.g. MG-CRS-261101-4F7A. */
export function makeReportReference(code: string) {
  const d = new Date();
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const suffix = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0");
  return `MG-${code}-${stamp}-${suffix}`;
}

/**
 * Both calculators can hold a prepared report at once, so mark which one
 * this print is for; the print stylesheet hides the other.
 */
export function printReport(kind: ReportKind) {
  document.body.dataset.printReport = kind;
  setTimeout(() => window.print(), 100);
}

function Meter({ value, max }: { value: number; max: number }) {
  return (
    <span className="ir-meter" aria-hidden="true">
      <span style={{ width: `${pct(value, max)}%` }} />
    </span>
  );
}

function ReportBody(props: ImmigrationReportProps) {
  const { programme, title, clientName, date, reference, score, scoreContext, scale, status, facts, sections, totalLabel, totalMaxLabel, notes } = props;

  return (
    <>
      <header className="ir-letterhead">
        <div className="ir-brand">
          <Image src="/Logo W.png" alt="MG Visa" width={96} height={96} unoptimized loading="eager" className="ir-logo" />
          <div>
            <p className="ir-firm">MG International Visa Consultancy</p>
            <p className="ir-firm-meta">Cairo · Dubai · Zayed &nbsp;|&nbsp; Info@mg-visa.com · 17621</p>
          </div>
        </div>
        <dl className="ir-docmeta">
          <div><dt>Document</dt><dd>Client assessment summary</dd></div>
          <div><dt>Reference</dt><dd>{reference}</dd></div>
          <div><dt>Issued</dt><dd>{date}</dd></div>
        </dl>
      </header>

      <section className="ir-title">
        <h1>{title}</h1>
        <p className="ir-programme">{programme}</p>
        <p className="ir-client">Prepared for <strong>{clientName}</strong></p>
      </section>

      <section className="ir-score" aria-label="Overall result">
        <div className="ir-score-figure">
          <p className="ir-score-value">{fmt(score)}</p>
          <p className="ir-score-context">{scoreContext}</p>
        </div>
        <div className="ir-score-verdict">
          <p className="ir-status"><span style={{ backgroundColor: status.color }} />{status.label}</p>
          <p className="ir-status-text">{status.description}</p>
        </div>
        <div className="ir-scale">
          <div className="ir-scale-track">
            <span className="ir-scale-fill" style={{ width: `${pct(score, scale.max)}%` }} />
            {scale.marks.map((mark) => (
              <span key={mark.value} className="ir-scale-mark" style={{ left: `${pct(mark.value, scale.max)}%` }}>
                <i />
                <b>{mark.label}</b>
              </span>
            ))}
          </div>
          <div className="ir-scale-ends"><span>0</span><span>{scale.endLabel}</span></div>
        </div>
      </section>

      <div className="ir-overview">
        <section>
          <h2>Score composition</h2>
          <ul className="ir-composition">
            {sections.map((section) => {
              const t = sectionTotals(section);
              return (
                <li key={section.key}>
                  <div><span>{section.title}</span><strong>{fmt(t.earned)}<small> / {fmt(t.max)}</small></strong></div>
                  <Meter value={t.earned} max={t.max} />
                </li>
              );
            })}
          </ul>
        </section>
        <section>
          <h2>Profile assessed</h2>
          <dl className="ir-facts">
            {facts.map((fact) => (
              <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>
            ))}
          </dl>
        </section>
      </div>

      <section className="ir-notes">
        <h2>Important information</h2>
        {notes.map((note) => <p key={note}>{note}</p>)}
      </section>

      <div className="ir-details">
        <h2 className="ir-details-heading">Detailed points breakdown</h2>
        {sections.map((section) => {
          const t = sectionTotals(section);
          return (
            <section key={section.key} className="ir-section">
              <div className="ir-section-head">
                <div>
                  <h3><span>{section.key}</span>{section.title}</h3>
                  <p>{section.caption}</p>
                </div>
                <p className="ir-section-total">{fmt(t.earned)}<small> / {fmt(t.max)}</small></p>
              </div>
              <table className="ir-table">
                <thead>
                  <tr><th scope="col">Factor</th><th scope="col">Points</th><th scope="col"><span className="sr-only">Share of maximum</span></th></tr>
                </thead>
                <tbody>
                  {section.rows.map((row) => (
                    <tr key={row.label} className={row.max === undefined ? "is-adjustment" : undefined}>
                      <th scope="row">
                        <span className="ir-factor">{row.label}</span>
                        <span className="ir-claim">{row.claim}</span>
                      </th>
                      <td className="ir-points">
                        {row.max === undefined
                          ? <strong>{row.earned < 0 ? `−${fmt(-row.earned)}` : fmt(row.earned)}</strong>
                          : <><strong>{fmt(row.earned)}</strong><small> / {fmt(row.max)}</small></>}
                      </td>
                      <td className="ir-bar">{row.max !== undefined && <Meter value={row.earned} max={row.max} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          );
        })}

        <div className="ir-grand-total">
          <span>{totalLabel}</span>
          <span className="ir-grand-figure"><strong>{fmt(score)}</strong><small>{totalMaxLabel}</small></span>
        </div>

        <footer className="ir-signoff">
          <div><span className="ir-line" /><p>Reviewed by — MG Visa advisor</p></div>
          <div><span className="ir-line" /><p>Date</p></div>
          <div className="ir-contact">
            <p><strong>MG International Visa Consultancy</strong></p>
            <p>mg-visa.com · Info@mg-visa.com · Hotline 17621</p>
            <p>Confidential — prepared for {clientName}</p>
          </div>
        </footer>
      </div>
    </>
  );
}

/**
 * Mounted while the results screen is open (hidden on screen) so the logo is
 * already loaded when the print dialog opens; printing shows only this report.
 * Results screens render only on the client, after the form is submitted.
 */
export default function ImmigrationReport(props: ImmigrationReportProps) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <article className="ir-report" data-report={props.kind} aria-label={`${props.title} report for ${props.clientName}`}>
      <ReportBody {...props} />
    </article>,
    document.body
  );
}
