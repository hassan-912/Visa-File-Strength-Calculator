"use client";

import { useEffect, useRef, useState } from "react";
import {
  CATEGORIES,
  PENALTIES,
  AGE_MAX_SCORE,
  calculateScore,
  getScoreStatus,
  getAgeScore,
} from "@/lib/scoring";
import type { SelectionsMap, PenaltiesMap } from "@/lib/scoring";

interface ResultsDashboardProps {
  selections: SelectionsMap;
  activePenalties: PenaltiesMap;
  age: number | null;
  onEdit: () => void;
}

function useCountUp(target: number, duration = 1600) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setCurrent(target);
        clearInterval(interval);
      } else {
        setCurrent(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration]);
  return current;
}

export default function ResultsDashboard({
  selections,
  activePenalties,
  age,
  onEdit,
}: ResultsDashboardProps) {
  const { baseScore, totalDeductions, finalScore, ageScore, categoryScores } =
    calculateScore(selections, activePenalties, age);

  const status = getScoreStatus(finalScore);
  const displayScore = useCountUp(finalScore, 1800);
  const [barsVisible, setBarsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState("");
  const [reportDate, setReportDate] = useState("");

  const handleGeneratePdf = () => {
    setReportDate(new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }));
    setShowModal(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

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
                      width: barsVisible ? `${pct}%` : "0%",
                      transitionDuration: `${600 + idx * 100}ms`,
                      backgroundColor: pct >= 70 ? "var(--color-strong)" : pct >= 40 ? "var(--color-moderate)" : pct > 0 ? "var(--color-weak)" : "var(--color-border)",
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Age row */}
          {(() => {
            const ageData = categoryScores["age_input"] || { earned: ageScore, max: AGE_MAX_SCORE };
            const agePct = AGE_MAX_SCORE > 0 ? (ageData.earned / AGE_MAX_SCORE) * 100 : 0;
            return (
              <div style={{ animationDelay: `${CATEGORIES.length * 80}ms` }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🧑</span>
                    <span className="text-sm font-semibold" style={{ color: "var(--color-text-main)" }}>
                      Age {age !== null ? `(${age} years)` : ""}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: agePct >= 70 ? "var(--color-strong)" : agePct >= 40 ? "var(--color-moderate)" : "var(--color-text-muted)",
                    }}
                  >
                    {age === null ? "Not entered" : agePct === 100 ? "Full marks" : agePct > 0 ? "Scored" : "No score"}
                  </span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface-3)" }}>
                  <div
                    className="h-full rounded-full transition-all ease-out"
                    style={{
                      width: barsVisible ? `${agePct}%` : "0%",
                      transitionDuration: `${600 + CATEGORIES.length * 100}ms`,
                      backgroundColor: agePct >= 70 ? "var(--color-strong)" : agePct >= 40 ? "var(--color-moderate)" : agePct > 0 ? "var(--color-weak)" : "var(--color-border)",
                    }}
                  />
                </div>
              </div>
            );
          })()}
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fadeInUp">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Generate PDF Report</h3>
            <p className="text-sm text-slate-500 mb-6">Enter the client's full name to generate an official MG Visa assessment document.</p>
            
            <input 
              type="text" 
              placeholder="e.g. John Doe"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-800 focus:outline-none mb-6 text-slate-800 bg-white"
            />

            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleGeneratePdf}
                disabled={!clientName.trim()}
                className="flex-1 py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* ── Print Layout (Hidden on Screen, Invoice Structure) ── */}
      <div className="hidden print:flex print:flex-col print:absolute print:top-0 print:left-0 print:w-full print:h-[297mm] print:m-0 print:p-0 print:bg-white print:text-black overflow-hidden relative font-sans">
        
        {/* Print Watermark */}
        <div className="print-watermark">
          <img src="/Logo W.png" alt="Watermark" className="filter invert" />
        </div>

        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-10 border-b-4 border-slate-800 pb-6 relative z-10 print-content-row pt-4">
          <div className="flex flex-col">
            <img src="/Logo W.png" alt="MG Visa" className="h-14 object-contain filter invert mb-4 w-32" />
            <h2 className="text-xl font-black text-slate-800 tracking-wider">MG International Visa Consultancy</h2>
            <p className="text-sm text-slate-600 mt-1">Cairo | Dubai | Zayed</p>
            <p className="text-sm text-slate-600">Info@mg-visa.com</p>
          </div>
          
          <div className="text-right flex flex-col justify-end h-full">
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-widest mb-4">Assessment Report</h1>
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg text-left inline-block self-end min-w-[250px]">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Prepared For</p>
              <p className="text-xl font-bold text-black mb-2">{clientName || "Client"}</p>
              <div className="flex justify-between text-sm text-slate-600">
                <span className="font-semibold">Date:</span>
                <span>{reportDate}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 mt-1">
                <span className="font-semibold">Report ID:</span>
                <span className="uppercase">{Math.random().toString(36).substr(2, 8)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="w-full mb-8 relative z-10 print-content-row flex-grow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="py-3 px-4 text-sm font-bold uppercase tracking-wider w-1/2">Description</th>
                <th className="py-3 px-4 text-sm font-bold uppercase tracking-wider text-center">Max Score</th>
                <th className="py-3 px-4 text-sm font-bold uppercase tracking-wider text-center">Earned Score</th>
                <th className="py-3 px-4 text-sm font-bold uppercase tracking-wider text-right">Status / Remarks</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat, idx) => {
                const { earned, max } = categoryScores[cat.id] || { earned: 0, max: cat.maxScore };
                const pct = max > 0 ? (earned / max) * 100 : 0;
                const strengthLabel = pct === 100 ? "Full marks" : pct >= 70 ? "Strong" : pct >= 40 ? "Moderate" : earned === 0 ? "Not scored" : "Weak";
                return (
                  <tr key={cat.id} className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'} print-content-row`}>
                    <td className="py-4 px-4 text-sm font-bold text-slate-800">{cat.title}</td>
                    <td className="py-4 px-4 text-sm text-slate-600 text-center">{max}</td>
                    <td className="py-4 px-4 text-sm font-black text-slate-900 text-center">{earned}</td>
                    <td className="py-4 px-4 text-xs font-bold text-slate-500 uppercase text-right">{strengthLabel}</td>
                  </tr>
                );
              })}
              {/* Age */}
              {(() => {
                const ageData = categoryScores["age_input"] || { earned: ageScore, max: AGE_MAX_SCORE };
                const agePct = AGE_MAX_SCORE > 0 ? (ageData.earned / AGE_MAX_SCORE) * 100 : 0;
                const ageLabel = age === null ? "Not entered" : agePct === 100 ? "Full marks" : agePct > 0 ? "Scored" : "No score";
                return (
                  <tr className="border-b border-slate-200 bg-white print-content-row">
                    <td className="py-4 px-4 text-sm font-bold text-slate-800">Age {age !== null ? `(${age} years)` : ""}</td>
                    <td className="py-4 px-4 text-sm text-slate-600 text-center">{AGE_MAX_SCORE}</td>
                    <td className="py-4 px-4 text-sm font-black text-slate-900 text-center">{ageData.earned}</td>
                    <td className="py-4 px-4 text-xs font-bold text-slate-500 uppercase text-right">{ageLabel}</td>
                  </tr>
                )
              })()}
              
              {/* Penalties as Deductions */}
              {activePenaltyList.map((p) => (
                <tr key={p.id} className="border-b border-slate-200 bg-red-50 print-content-row">
                  <td className="py-3 px-4 text-sm font-semibold text-red-800">Deduction: {p.label}</td>
                  <td className="py-3 px-4 text-sm text-red-600 text-center">-</td>
                  <td className="py-3 px-4 text-sm font-black text-red-700 text-center">-{p.deduction || 10}</td>
                  <td className="py-3 px-4 text-xs font-bold text-red-500 uppercase text-right">Penalty</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Block */}
        <div className="flex justify-end relative z-10 print-content-row mt-4">
          <div className="w-2/5 border-t-4 border-slate-800 pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold text-slate-600 uppercase">Subtotal (Base Score)</span>
              <span className="font-black text-slate-800">{baseScore}</span>
            </div>
            <div className="flex justify-between text-sm mb-4">
              <span className="font-bold text-slate-600 uppercase">Deductions (Fees)</span>
              <span className="font-black text-red-600">{totalDeductions > 0 ? `-${totalDeductions}` : "0"}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-4">
              <span className="text-xl font-black uppercase text-slate-900">Final Assessment</span>
              <span className="text-4xl font-black" style={{ color: status.colorVar }}>{finalScore}%</span>
            </div>
            <div className="text-right mt-2">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{status.label}</span>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
