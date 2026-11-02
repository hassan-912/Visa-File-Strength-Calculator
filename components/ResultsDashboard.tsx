"use client";

import { useEffect, useState, useRef } from "react";
import {
  CATEGORIES,
  PENALTIES,
  calculateScore,
  getScoreStatus,
} from "@/lib/scoring";
import type { SelectionsMap, PenaltiesMap } from "@/lib/scoring";
import ClientReport, { makeReportReference, printReport } from "@/components/ClientReport";

const todayLabel = () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

interface ResultsDashboardProps {
  selections: SelectionsMap;
  activePenalties: PenaltiesMap;
  age: number | null;
  onEdit: () => void;
}

export default function ResultsDashboard({
  selections,
  activePenalties,
  age,
  onEdit,
}: ResultsDashboardProps) {
  const { baseScore, totalDeductions, finalScore, categoryScores } =
    calculateScore(selections, activePenalties, age);

  const status = getScoreStatus(finalScore);
  const displayScore = finalScore;
  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportRef] = useState(() => makeReportReference("TV"));
  const reportDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = reportDialog.current;
    if (showModal && dialog && !dialog.open) dialog.showModal();
    if (!showModal && dialog?.open) dialog.close();
  }, [showModal]);

  const handleGeneratePdf = () => {
    setReportDate(todayLabel());
    setShowModal(false);
    printReport("tourism");
  };

  // SVG arc gauge (navy-themed)
  const SIZE = 200;
  const STROKE = 16;
  const R = (SIZE - STROKE) / 2;
  const C = SIZE / 2;
  const ARC_DEG = 220;
  const GAP_DEG = 360 - ARC_DEG;
  const START = 90 + GAP_DEG / 2;

  function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
    const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  const trackD = arcPath(C, C, R, START, START + ARC_DEG);
  const fillEnd = START + (displayScore / 100) * ARC_DEG;
  const fillD = displayScore > 0 ? arcPath(C, C, R, START, fillEnd) : "";

  const activePenaltyList = PENALTIES.filter((p) => activePenalties[p.id]);
  const selectedLabels = (categoryId: string) => {
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    const chosen = cat?.options.filter((opt) => selections[categoryId]?.includes(opt.id)).map((opt) => opt.label) ?? [];
    return chosen.length > 0 ? chosen.join(" · ") : "None selected";
  };

  return (
    <>
      {/* ── Screen Layout (Hidden on Print) ── */}
      <div id="web-layout-wrapper" className="animate-fadeInUp max-w-3xl mx-auto print:hidden">

        {/* ── Screen Hero Result Card ── */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl mb-6"
          style={{
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-mid) 100%)",
          }}
        >
          {/* Top status color bar */}
          <div
            className="h-1"
            style={{
              background: `linear-gradient(90deg, transparent, ${status.colorVar}, transparent)`,
            }}
          />

          <div className="p-6 sm:p-8">
            {/* Header row */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  MG Visa AI Analysis — Complete
                </p>
                <h2
                  id="assessment-results" tabIndex={-1}
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "var(--font-montserrat)" }}
                >
                  Your Visa File Assessment
                </h2>
              </div>
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl font-bold text-sm"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#FFFFFF",
                  fontFamily: "var(--font-montserrat)",
                }}
              >
                MG
              </div>
            </div>

            {/* Score + Gauge */}
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* SVG Gauge */}
              <div className="shrink-0">
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-label={`Score: ${finalScore}%`}>
                  <defs>
                    <linearGradient id="fillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={status.colorVar} stopOpacity="0.5" />
                      <stop offset="100%" stopColor={status.colorVar} stopOpacity="1" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <path d={trackD} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={STROKE} strokeLinecap="round" />
                  {displayScore > 0 && (
                    <path d={fillD} fill="none" stroke="url(#fillGrad)" strokeWidth={STROKE} strokeLinecap="round" filter="url(#glow)" />
                  )}
                  <text x={C} y={C - 8} textAnchor="middle" dominantBaseline="middle" fontSize="48" fontWeight="800" fontFamily="Montserrat, sans-serif" fill={status.colorVar}>
                    {displayScore}
                  </text>
                  <text x={C} y={C + 24} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="500" fontFamily="Montserrat, sans-serif" fill="rgba(255,255,255,0.35)">
                    out of 100
                  </text>
                </svg>
              </div>

              {/* Status text */}
              <div className="flex-1 text-center sm:text-left">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4"
                  style={{
                    backgroundColor: `${status.colorVar}22`,
                    border: `1.5px solid ${status.colorVar}66`,
                    color: status.colorVar,
                  }}
                >
                  <span>{status.emoji}</span>
                  <span style={{ fontFamily: "var(--font-montserrat)" }}>{status.label}</span>
                </div>

                <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {status.sublabel}
                </p>

                {/* Stat pills */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Base Score", value: `${baseScore}%`, warn: false },
                    { label: "Penalties", value: totalDeductions > 0 ? `-${totalDeductions}%` : "None", warn: totalDeductions > 0 },
                    { label: "Final Score", value: `${finalScore}%`, highlight: true },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl p-3 text-center"
                      style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                    >
                      <p className="text-[11px] mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{stat.label}</p>
                      <p
                        className="text-base font-bold"
                        style={{
                          color: stat.warn ? "#f87171" : stat.highlight ? status.colorVar : "#FFFFFF",
                          fontFamily: "var(--font-montserrat)",
                        }}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Screen Score Breakdown ── */}
        <div
          className="rounded-2xl border p-6 mb-5 shadow-sm"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border-light)" }}
        >
          <h3
            className="text-base font-bold mb-5"
            style={{ color: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
          >
            Score Breakdown by Category
          </h3>

          <div className="space-y-4">
            {/* Standard categories */}
            {CATEGORIES.map((cat, idx) => {
              const { earned, max } = categoryScores[cat.id] || { earned: 0, max: cat.maxScore };
              const pct = max > 0 ? (earned / max) * 100 : 0;
              const strengthLabel = pct === 100 ? "Full marks" : pct >= 70 ? "Strong" : pct >= 40 ? "Moderate" : earned === 0 ? "Not scored" : "Weak";

              return (
                <div key={cat.id} style={{ animationDelay: `${idx * 80}ms` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-sm font-semibold" style={{ color: "var(--color-text-main)" }}>
                        {cat.title}
                      </span>
                    </div>
                    <span
                      className="text-xs font-bold"
                      style={{
                        color: pct >= 70 ? "var(--color-strong)" : pct >= 40 ? "var(--color-moderate)" : "var(--color-text-muted)",
                      }}
                    >
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface-3)" }}>
                    <div
                      className="h-full rounded-full transition-all ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 70 ? "var(--color-strong)" : pct >= 40 ? "var(--color-moderate)" : pct > 0 ? "var(--color-weak)" : "var(--color-border)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Screen Active Penalties ── */}
        {activePenaltyList.length > 0 && (
          <div
            className="rounded-2xl border p-6 mb-5 shadow-sm"
            style={{ backgroundColor: "#FFF5F5", borderColor: "#FECACA" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⚠️</span>
              <h3 className="text-base font-bold" style={{ color: "#991B1B", fontFamily: "var(--font-montserrat)" }}>
                Risk Factors Detected
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: "#7F1D1D" }}>
              The following factors significantly reduce your visa file score. An MG Visa consultant can help you address these.
            </p>
            <ul className="space-y-2">
              {activePenaltyList.map((p) => (
                <li key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: "rgba(220,38,38,0.06)" }}>
                  <span className="text-red-500 shrink-0">●</span>
                  <p className="text-sm font-medium" style={{ color: "#991B1B" }}>{p.label}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Buttons ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onEdit}
            id="edit-profile-button"
            aria-label="Edit application profile and re-analyse"
            className="w-full py-4 px-6 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 border-2"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
              fontFamily: "var(--font-montserrat)",
            }}
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full py-4 px-6 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 text-white shadow-lg"
            style={{
              backgroundColor: "var(--color-primary)",
              fontFamily: "var(--font-montserrat)",
            }}
          >
            Generate Official PDF Report
          </button>
        </div>

        {/* ── PDF Generation Modal ── */}
          <dialog ref={reportDialog} aria-labelledby="report-dialog-title" onClose={() => setShowModal(false)} className="report-dialog">
            <form onSubmit={(event) => { event.preventDefault(); if (clientName.trim()) handleGeneratePdf(); }} className="p-6 sm:p-8">
              <h3 id="report-dialog-title" className="text-xl font-bold text-slate-800 mb-2">Generate PDF Report</h3>
              <p className="text-sm text-slate-600 mb-6">Enter the client&apos;s full name to generate an official MG Visa assessment document.</p>
              <label htmlFor="report-client-name" className="block text-sm font-semibold mb-2">Client name</label>
              <input
                id="report-client-name"
                type="text"
                required maxLength={150}
                placeholder="e.g. John Doe"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-800 focus:outline-none mb-6 text-slate-800 bg-white"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!clientName.trim()}
                  className="flex-1 py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Generate
                </button>
              </div>
            </form>
          </dialog>
      </div>

      <ClientReport
        kind="tourism"
        programme="Tourist visa · MG file-strength scoring"
        title="Visa File Strength Assessment"
        clientName={clientName.trim() || "Client"}
        date={reportDate || todayLabel()}
        reference={reportRef}
        score={finalScore}
        scoreSuffix="%"
        scoreContext="File-strength score, out of 100"
        scale={{ max: 100, endLabel: "100", marks: [{ value: 60, label: "Moderate · 60" }, { value: 80, label: "Strong · 80" }] }}
        status={{ label: status.label, color: status.colorVar, description: status.sublabel }}
        facts={CATEGORIES.filter((cat) => cat.inputType !== "checkbox").map((cat) => ({ label: cat.title, value: selectedLabels(cat.id) }))}
        composition={CATEGORIES.map((cat) => ({ label: cat.title, ...(categoryScores[cat.id] ?? { earned: 0, max: cat.maxScore }) }))}
        detailsHeading="Detailed score breakdown"
        sections={[
          {
            key: "A",
            title: "Profile factors",
            caption: "Points awarded for each part of the application file",
            rows: CATEGORIES.map((cat) => ({ label: cat.title, claim: selectedLabels(cat.id), earned: categoryScores[cat.id]?.earned ?? 0, max: categoryScores[cat.id]?.max ?? cat.maxScore })),
          },
          ...(activePenaltyList.length > 0 ? [{
            key: "B",
            title: "Risk deductions",
            caption: "Declared history that reduces the file-strength score",
            hideFromComposition: true,
            rows: activePenaltyList.map((p) => ({ label: p.label, claim: p.description, earned: -p.deduction })),
          }] : []),
        ]}
        total={{
          label: "Final file-strength score",
          value: `${finalScore}%`,
          context: totalDeductions > 0 ? `base ${baseScore} − deductions ${totalDeductions}` : "no deductions applied",
        }}
        notes={[
          "This assessment is indicative only and reflects MG's file-strength scoring of the answers provided. It is for informational purposes and does not constitute legal or immigration advice, or guarantee a visa decision.",
          "The score reflects the information provided on the date above. For a full review of your documents, contact a licensed MG Visa advisor.",
        ]}
      />
    </>
  );
}
