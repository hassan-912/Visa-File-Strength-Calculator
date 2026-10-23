"use client";

import { useId, useState } from "react";
import {
  getOccupationOptionLabel,
  JURISDICTIONS,
  OCCUPATION_SECTORS,
  OCCUPATION_SOURCES,
  OCCUPATIONS_REVIEWED_ON,
  REGULATED_OCCUPATIONS,
} from "@/lib/canada-occupations";

const NONE = "none";
const selectClassName = "w-full min-w-0 rounded-xl border-2 bg-white px-3 py-3 text-sm text-slate-800 disabled:bg-slate-100 disabled:text-slate-400";

export default function CanadaOccupationChecker() {
  const baseId = useId();
  const [sector, setSector] = useState("");
  const [family, setFamily] = useState("");
  const [occupationId, setOccupationId] = useState("");

  const sectorOccupations = REGULATED_OCCUPATIONS.filter((occupation) => occupation.sector === sector);
  const families = Array.from(new Set(sectorOccupations.map((occupation) => occupation.family))).sort();
  const showFamily = families.length > 1 && sectorOccupations.length > 15;
  const choices = sectorOccupations.filter((occupation) => !showFamily || occupation.family === family);
  const selected = sectorOccupations.find((occupation) => occupation.id === occupationId);
  const noMatch = sector === NONE || occupationId === NONE;
  const selectedSources = selected?.sourceIds.map((id) => OCCUPATION_SOURCES[id]) ?? [];
  const reviewedDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${OCCUPATIONS_REVIEWED_ON}T12:00:00Z`));

  return (
    <section
      aria-labelledby={`${baseId}-heading`}
      className="mb-10 overflow-hidden rounded-2xl border shadow-sm print:hidden"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border-light)" }}
    >
      <div className="border-b px-5 py-5 sm:px-6" style={{ borderColor: "var(--color-border-light)" }}>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
          Canada · Occupation check
        </p>
        <h2 id={`${baseId}-heading`} className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
          Is your occupation regulated?
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          Choose your field, then your profession. Only regulated roles and protected professional titles are listed.
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <label htmlFor={`${baseId}-sector`} className="mb-1.5 block text-sm font-semibold text-slate-800">
            Profession / field
          </label>
          <select
            id={`${baseId}-sector`}
            value={sector}
            className={selectClassName}
            style={{ borderColor: "var(--color-border-light)" }}
            onChange={(event) => {
              setSector(event.target.value);
              setFamily("");
              setOccupationId("");
            }}
          >
            <option value="" disabled>Select your field…</option>
            <option value={NONE}>None of these occupations</option>
            {OCCUPATION_SECTORS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </div>

        {sector && sector !== NONE && (
          <>
            {showFamily && (
              <div>
                <label htmlFor={`${baseId}-family`} className="mb-1.5 block text-sm font-semibold text-slate-800">
                  Profession group
                </label>
                <select
                  id={`${baseId}-family`}
                  value={family}
                  className={selectClassName}
                  style={{ borderColor: "var(--color-border-light)" }}
                  onChange={(event) => {
                    setFamily(event.target.value);
                    setOccupationId("");
                  }}
                >
                  <option value="" disabled>Select a profession group…</option>
                  {families.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label htmlFor={`${baseId}-occupation`} className="mb-1.5 block text-sm font-semibold text-slate-800">
                Occupation / professional title
              </label>
              <select
                id={`${baseId}-occupation`}
                value={occupationId}
                disabled={showFamily && !family}
                aria-describedby={`${baseId}-locations`}
                className={selectClassName}
                style={{ borderColor: "var(--color-border-light)" }}
                onChange={(event) => setOccupationId(event.target.value)}
              >
                <option value="" disabled>Select your occupation…</option>
                <option value={NONE}>None of these occupations</option>
                {choices.map((occupation) => (
                  <option key={occupation.id} value={occupation.id}>{getOccupationOptionLabel(occupation)}</option>
                ))}
              </select>
              <p id={`${baseId}-locations`} className="mt-2 text-xs leading-relaxed text-slate-500">
                Brackets show the profession and regulated locations. “Confirmed” lists the places verified in official sources; other jurisdictions may also regulate the role.
              </p>
            </div>
          </>
        )}

        <div role="status" aria-live="polite" aria-atomic="true">
          {selected && (
            <div className="rounded-xl border p-4 sm:p-5" style={{ backgroundColor: "var(--color-accent-bg)", borderColor: "var(--color-accent-border)" }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>
                {selected.regulation === "title" ? "Protected professional title" : "Regulated occupation or professional title"}
              </p>
              <p className="break-words text-sm font-bold leading-relaxed text-slate-900">{getOccupationOptionLabel(selected)}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {selected.coverage === "exclusive"
                  ? `Regulated in ${selected.jurisdictions.map((code) => JURISDICTIONS[code]).join(", ")} only, according to the official sources below.`
                  : selected.coverage === "federal"
                    ? "Regulated under federal rules across Canada."
                    : selected.coverage === "canada-wide"
                      ? "Regulated across Canada. Apply to the relevant regulator for the work you plan to do."
                      : `Regulation confirmed in: ${selected.jurisdictions.map((code) => JURISDICTIONS[code]).join(", ")}.`}
              </p>
              {selected.regulation === "title" && (
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  Registration protects the professional title or designation. It does not automatically restrict all related work.
                </p>
              )}
              {selected.note && <p className="mt-2 text-sm leading-relaxed text-slate-700">{selected.note}</p>}
              <div className="mt-4 border-t pt-3 text-xs" style={{ borderColor: "var(--color-accent-border)" }}>
                <p className="mb-2 font-semibold text-slate-700">Official source</p>
                <a href={selectedSources[0].url} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-800 underline underline-offset-2">
                  {selectedSources[0].label} ↗
                </a>
                {selectedSources.length > 1 && (
                  <details className="mt-3">
                    <summary className="w-fit cursor-pointer font-semibold text-slate-700">More official sources ({selectedSources.length - 1})</summary>
                    <ul className="mt-2 space-y-2 pl-3">
                      {selectedSources.slice(1).map((item) => (
                        <li key={item.url}>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-slate-700 underline underline-offset-2">{item.label} ↗</a>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          )}
          {noMatch && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              <p className="mb-1 font-bold text-slate-900">No regulated occupation identified</p>
              <p>You selected none of the listed occupations. A missing match does not confirm that every title or activity in your role is unregulated.</p>
            </div>
          )}
        </div>

        <p className="text-[11px] leading-relaxed text-slate-500">
          Official sources checked {reviewedDate}. Locations refer to provinces and territories, rather than cities.
          Requirements depend on your exact duties and professional title. This check does not change your CRS score.
        </p>
      </div>
    </section>
  );
}
