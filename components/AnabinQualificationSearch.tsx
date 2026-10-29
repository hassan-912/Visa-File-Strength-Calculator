"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import type { AnabinKind, AnabinMatch } from "@/lib/anabin";
import type { JobSeekerAnswers } from "@/lib/job-seeker";

interface SearchProps {
  id: string;
  kind: AnabinKind;
  label: string;
  value: string;
  selectedId?: string;
  selectionSummary?: string;
  institutionId?: string;
  onInput: (text: string) => void;
  onSelect: (record: AnabinMatch) => void;
}

function AnabinCombobox({ id, kind, label, value, selectedId, selectionSummary, institutionId, onInput, onSelect }: SearchProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [retry, setRetry] = useState(0);
  const [response, setResponse] = useState<{ key: string; state: "ready" | "error"; matches: AnabinMatch[] }>({ key: "", state: "ready", matches: [] });
  const query = value.trim();
  const key = `${kind}:${institutionId ?? ""}:${query}`;
  const current = response.key === key ? response : null;
  const matches = current?.matches ?? [];
  const searching = !selectedId && query.length >= 2;
  const popup = open && searching;
  const listId = `${id}-suggestions`;

  useEffect(() => {
    if (!searching) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ kind, q: query });
        if (kind === "degree" && institutionId) params.set("institution", institutionId);
        const result = await fetch(`/api/anabin?${params}`, { signal: controller.signal });
        if (!result.ok) throw new Error("Search unavailable");
        const data: { matches: AnabinMatch[] } = await result.json();
        if (!Array.isArray(data.matches)) throw new Error("Invalid results");
        if (!controller.signal.aborted) { setResponse({ key, state: "ready", matches: data.matches }); setActive(-1); }
      } catch {
        if (!controller.signal.aborted) setResponse({ key, state: "error", matches: [] });
      }
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [kind, query, institutionId, key, searching, retry]);

  function choose(record: AnabinMatch) { onSelect(record); setOpen(false); setActive(-1); }
  function keyboard(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") { setOpen(false); return; }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && searching) {
      event.preventDefault(); setOpen(true);
      if (matches.length) setActive(previous => event.key === "ArrowDown" ? (previous + 1) % matches.length : (previous <= 0 ? matches.length - 1 : previous - 1));
    }
    if (event.key === "Enter" && popup && matches.length) { event.preventDefault(); choose(matches[Math.max(0, active)]); }
  }

  return <div className="js-field js-anabin-field" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <label htmlFor={id}>{label}</label>
    <div className="js-anabin-input-wrap">
      <input id={id} name={kind === "institution" ? "university" : "degree"} type="text" role="combobox" aria-autocomplete="list" aria-expanded={popup && matches.length > 0} aria-controls={popup && matches.length ? listId : undefined} aria-activedescendant={popup && active >= 0 && matches[active] ? `${id}-option-${active}` : undefined} aria-describedby={`${id}-hint${selectedId ? ` ${id}-selection` : ""}`} autoComplete="off" maxLength={100} required value={value} onFocus={() => setOpen(true)} onChange={event => { setOpen(true); setActive(-1); onInput(event.target.value); }} onKeyDown={keyboard} placeholder={kind === "institution" ? "e.g. Ain Shams" : "e.g. computer science"} />
      {popup && <div className="js-anabin-popup">
        {!current && <p className="js-anabin-message" role="status">Searching Anabin…</p>}
        {current?.state === "error" && <div className="js-anabin-message" role="status"><p>Anabin is temporarily unavailable. No recognition conclusion can be made.</p><button type="button" className="js-anabin-retry" onClick={() => { setResponse({ key: "", state: "ready", matches: [] }); setRetry(count => count + 1); }}>Retry search</button></div>}
        {current?.state === "ready" && !matches.length && <p className="js-anabin-message" role="status">No matching records found. Try another spelling or a more specific name. This does not mean the qualification is unrecognised.</p>}
        {matches.length > 0 && <ul id={listId} role="listbox" aria-label={`${label} suggestions`}>{matches.map((record, index) => <li key={record.id} role="presentation">
          <button type="button" role="option" id={`${id}-option-${index}`} aria-selected={active === index} tabIndex={-1} className="js-anabin-option" onMouseDown={event => event.preventDefault()} onMouseEnter={() => setActive(index)} onClick={() => choose(record)}>
            <strong>{record.label}</strong><span>{record.subtitle}</span><span>{record.statusLabel}{kind === "degree" && institutionId ? record.association === "institution" ? " · Linked to this university" : " · Country-level record; university link unconfirmed" : ""}</span>
          </button>
        </li>)}</ul>}
      </div>}
    </div>
    <p id={`${id}-hint`}>{kind === "institution" ? "Type a university name to search Anabin." : institutionId ? "Search degrees or specialisations for this university; country-level matches are marked." : "Type a degree or specialisation; selecting a university narrows the results."}</p>
    {selectedId && <p id={`${id}-selection`} className="js-anabin-selection">{selectionSummary} <a href={kind === "institution" ? "https://anabin.kmk.org/db/institutionen" : "https://anabin.kmk.org/db/hochschulabschluesse"} target="_blank" rel="noopener noreferrer">Source: Anabin<span className="sr-only"> (opens in a new tab)</span></a></p>}
  </div>;
}

export default function AnabinQualificationSearch({ form, onChange }: { form: JobSeekerAnswers; onChange: (patch: JobSeekerAnswers) => void }) {
  const emptyDegree = { degree: "", anabinDegreeId: "", degreeStatus: "unknown", anabinDegreeAssociation: "", anabinDegreeSummary: "" };
  return <>
    <AnabinCombobox id="germany-university" kind="institution" label="University name" value={form.university ?? ""} selectedId={form.anabinInstitutionId} selectionSummary={form.anabinInstitutionSummary}
      onInput={university => onChange({ university, anabinInstitutionId: "", institutionStatus: "unknown", anabinInstitutionSummary: "", recognitionSource: "anabin", ...emptyDegree })}
      onSelect={record => onChange({ university: record.label, anabinInstitutionId: record.id, institutionStatus: record.status, anabinInstitutionSummary: `${record.statusLabel} · ${record.country}`, recognitionSource: "anabin", ...emptyDegree })} />
    <AnabinCombobox id="germany-degree" kind="degree" label="Degree / specialisation" value={form.degree ?? ""} selectedId={form.anabinDegreeId} selectionSummary={form.anabinDegreeSummary} institutionId={form.anabinInstitutionId}
      onInput={degree => onChange({ ...emptyDegree, degree, recognitionSource: "anabin" })}
      onSelect={record => onChange({ degree: record.label, anabinDegreeId: record.id, degreeStatus: record.status, anabinDegreeAssociation: record.association, anabinDegreeSummary: `${record.statusLabel} · ${record.subtitle}${record.association === "institution" ? " · Linked to the selected university" : " · University link unconfirmed; review required"}`, recognitionSource: "anabin" })} />
    <p className="js-bank-note sm:col-span-2">Choose a suggestion in each field. Editing a selection clears its recognition result. Names alone do not establish recognition.</p>
  </>;
}
