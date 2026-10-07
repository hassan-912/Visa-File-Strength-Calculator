"use client";

import { useState, useEffect, useRef } from "react";
import {
  calculateAustraliaGSM,
  DEFAULT_AUSTRALIA_GSM_FORM,
  getAustraliaGSMStatus,
  GSM_SUBCLASS_OPTIONS,
  GSM_AGE_OPTIONS,
  GSM_ENGLISH_OPTIONS,
  GSM_OVERSEAS_EXP_OPTIONS,
  GSM_AUSTRALIAN_EXP_OPTIONS,
  GSM_QUALIFICATION_OPTIONS,
  GSM_PARTNER_OPTIONS,
} from "@/lib/australia-gsm";
import type {
  AustraliaGSMForm as FormState,
  AustraliaGSMBreakdown,
  GSMOptionMeta,
} from "@/lib/australia-gsm";

// ─────────────────────────────────────────────────────────────────
// Count-Up Hook for Numerical Transitions
// ─────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
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

// ─────────────────────────────────────────────────────────────────
// Clickable Radio Card Option Component (Snappy #283840 Theme)
// ─────────────────────────────────────────────────────────────────
interface RadioOptionCardProps<T> {
  option: GSMOptionMeta<T>;
  isSelected: boolean;
  onSelect: (val: T) => void;
  name: string;
}

function RadioOptionCard<T extends string>({
  option,
  isSelected,
  onSelect,
  name,
}: RadioOptionCardProps<T>) {
  return (
    <label
      className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.008] active:scale-[0.995] ${
        isSelected
          ? "border-[#283840] bg-[#283840] text-white shadow-md"
          : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/60"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={option.value}
        checked={isSelected}
        onChange={() => onSelect(option.value)}
        className="sr-only"
      />
      <div className="flex items-start gap-3.5 pr-3">
        <div
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
            isSelected
              ? "border-white bg-white"
              : "border-slate-300 bg-white"
          }`}
        >
          {isSelected && <div className="w-2 h-2 rounded-full bg-[#283840]" />}
        </div>
        <div>
          <p
            className={`text-sm leading-snug ${
              isSelected ? "font-bold text-white" : "font-semibold text-slate-900"
            }`}
          >
            {option.label}
          </p>
          {option.description && (
            <p
              className={`text-xs mt-0.5 leading-relaxed ${
                isSelected ? "text-white/80" : "text-slate-500"
              }`}
            >
              {option.description}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold tabular-nums transition-colors duration-200 ${
            isSelected
              ? "bg-white/20 text-white border border-white/30"
              : option.points > 0
              ? "bg-slate-100 text-slate-700 border border-slate-200"
              : "bg-slate-50 text-slate-400 border border-slate-200"
          }`}
        >
          {option.badge}
        </span>
      </div>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────
// Binary (Yes/No) Radio Option Component
// ─────────────────────────────────────────────────────────────────
interface BinaryRadioProps {
  label: string;
  description: string;
  points: number;
  value: boolean | null;
  onChange: (v: boolean) => void;
  name: string;
}

function BinaryRadio({
  label,
  description,
  points,
  value,
  onChange,
  name,
}: BinaryRadioProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Yes Option */}
      <label
        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.008] active:scale-[0.995] ${
          value === true
            ? "border-[#283840] bg-[#283840] text-white shadow-md"
            : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/60"
        }`}
      >
        <input
          type="radio"
          name={name}
          checked={value === true}
          onChange={() => onChange(true)}
          className="sr-only"
        />
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
              value === true ? "border-white bg-white" : "border-slate-300 bg-white"
            }`}
          >
            {value === true && <div className="w-2 h-2 rounded-full bg-[#283840]" />}
          </div>
          <div>
            <p className={`text-sm ${value === true ? "font-bold text-white" : "font-semibold text-slate-900"}`}>
              Yes — {label}
            </p>
            <p className={`text-xs mt-0.5 ${value === true ? "text-white/80" : "text-slate-500"}`}>
              {description}
            </p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 tabular-nums ${
            value === true
              ? "bg-white/20 text-white border border-white/30"
              : "bg-slate-100 text-slate-700 border border-slate-200"
          }`}
        >
          +{points} pts
        </span>
      </label>

      {/* No Option */}
      <label
        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.008] active:scale-[0.995] ${
          value === false
            ? "border-[#283840] bg-[#283840] text-white shadow-md"
            : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50/60"
        }`}
      >
        <input
          type="radio"
          name={name}
          checked={value === false}
          onChange={() => onChange(false)}
          className="sr-only"
        />
        <div className="flex items-center gap-3">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
              value === false ? "border-white bg-white" : "border-slate-300 bg-white"
            }`}
          >
            {value === false && <div className="w-2 h-2 rounded-full bg-[#283840]" />}
          </div>
          <div>
            <p className={`text-sm ${value === false ? "font-bold text-white" : "font-semibold text-slate-900"}`}>
              No — Do not meet requirement
            </p>
            <p className={`text-xs mt-0.5 ${value === false ? "text-white/80" : "text-slate-500"}`}>
              Not claimed
            </p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 tabular-nums ${
            value === false
              ? "bg-white/20 text-white border border-white/30"
              : "bg-slate-50 text-slate-400 border border-slate-200"
          }`}
        >
          0 pts
        </span>
      </label>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Helper to Check if a Given Card Criterion has been Answered
// ─────────────────────────────────────────────────────────────────
function isCardAnswered(idx: number, state: FormState): boolean {
  switch (idx) {
    case 0: return state.subclass !== "";
    case 1: return state.age !== "";
    case 2: return state.english !== "";
    case 3: return state.overseasExp !== "";
    case 4: return state.australianExp !== "";
    case 5: return state.qualification !== "";
    case 6: return state.specialistEducation !== null;
    case 7: return state.australianStudy !== null;
    case 8: return state.professionalYear !== null;
    case 9: return state.communityLanguage !== null;
    case 10: return state.regionalStudy !== null;
    case 11: return state.partnerSkills !== "";
    default: return false;
  }
}

// ─────────────────────────────────────────────────────────────────
// Dedicated Results Dashboard Component (Full-Screen View)
// ─────────────────────────────────────────────────────────────────
interface ResultsDashboardProps {
  form: FormState;
  breakdown: AustraliaGSMBreakdown;
  onRecalculate: () => void;
}

function AustraliaGSMResultsView({
  form,
  breakdown,
  onRecalculate,
}: ResultsDashboardProps) {
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [clientName, setClientName] = useState("");
  const [reportDate, setReportDate] = useState("");

  const displayScore = useCountUp(breakdown.total, 1600);
  const status = getAustraliaGSMStatus(breakdown.total);

  const handleGeneratePdf = () => {
    setReportDate(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    setShowPdfModal(false);
    setTimeout(() => window.print(), 100);
  };

  // Circular gauge setup
  const SIZE = 200, STROKE = 16, R = (SIZE - STROKE) / 2, C = SIZE / 2;
  const ARC_DEG = 220, GAP_DEG = 360 - ARC_DEG, START = 90 + GAP_DEG / 2;

  function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
    const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg)), y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg)), y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  const trackD = arcPath(C, C, R, START, START + ARC_DEG);
  const gaugeMax = 100;
  const fillEnd = START + Math.min(1, displayScore / gaugeMax) * ARC_DEG;
  const fillD = displayScore > 0 ? arcPath(C, C, R, START, fillEnd) : "";

  return (
    <>
      <div className="animate-fadeInUp print:hidden">
        {/* Hero Card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl mb-6 text-white"
          style={{
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-mid) 100%)",
          }}
        >
          <div
            className="h-1"
            style={{
              background: `linear-gradient(90deg, transparent, ${status.color}, transparent)`,
            }}
          />
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1 text-white/50">
                  Australia Skilled Migration — Points Test
                </p>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-montserrat)" }}>
                  Your GSM Points Score Result
                </h2>
              </div>
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl font-bold text-sm bg-white/10 text-white"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                🇦🇺
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Gauge */}
              <div className="shrink-0">
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-label={`GSM Score: ${breakdown.total}`}>
                  <defs>
                    <linearGradient id="gsmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={status.color} stopOpacity="0.5" />
                      <stop offset="100%" stopColor={status.color} stopOpacity="1" />
                    </linearGradient>
                    <filter id="gsmGlow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path d={trackD} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={STROKE} strokeLinecap="round" />
                  {displayScore > 0 && (
                    <path d={fillD} fill="none" stroke="url(#gsmGrad)" strokeWidth={STROKE} strokeLinecap="round" filter="url(#gsmGlow)" />
                  )}
                  <text
                    x={C}
                    y={C - 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="38"
                    fontWeight="800"
                    fontFamily="Montserrat,sans-serif"
                    fill={status.color}
                  >
                    {displayScore}
                  </text>
                  <text
                    x={C}
                    y={C + 18}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fontWeight="500"
                    fontFamily="Montserrat,sans-serif"
                    fill="rgba(255,255,255,0.45)"
                  >
                    points (65 min)
                  </text>
                </svg>
              </div>

              {/* Status Info */}
              <div className="flex-1 text-center sm:text-left">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-3"
                  style={{
                    backgroundColor: `${status.color}22`,
                    border: `1.5px solid ${status.color}66`,
                    color: status.color,
                  }}
                >
                  <span>{status.emoji}</span>
                  <span style={{ fontFamily: "var(--font-montserrat)" }}>{status.label}</span>
                </div>
                <p className="text-sm leading-relaxed mb-5 text-white/70">
                  {status.description}
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: "Passing Cutoff", value: "65 pts" },
                    { label: "Your Total", value: `${breakdown.total} pts`, highlight: true },
                    {
                      label: "EOI Eligible",
                      value: breakdown.isEligible ? "PASS" : "BELOW 65",
                      badgeColor: breakdown.isEligible ? "#16A34A" : "#DC2626",
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl p-3 text-center bg-white/5 border border-white/10">
                      <p className="text-[10px] text-white/50 mb-1">{item.label}</p>
                      <p
                        className="text-sm sm:text-base font-bold tabular-nums"
                        style={{
                          color: item.badgeColor || (item.highlight ? status.color : "#FFFFFF"),
                          fontFamily: "var(--font-montserrat)",
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Points Grid Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
          <h3 className="text-base font-bold mb-4 text-[#283840]" style={{ fontFamily: "var(--font-montserrat)" }}>
            Department of Home Affairs Points Breakdown
          </h3>
          <div className="space-y-3.5">
            {[
              { label: "Visa Subclass Nomination", earned: breakdown.subclassScore, max: 15, icon: "🇦🇺" },
              { label: "Age", earned: breakdown.ageScore, max: 30, icon: "🧑" },
              { label: "English Language Proficiency", earned: breakdown.englishScore, max: 20, icon: "🗣️" },
              {
                label: "Combined Skilled Employment (max 20 pts)",
                earned: breakdown.combinedEmploymentScore,
                max: 20,
                icon: "💼",
                extra:
                  breakdown.employmentCappedDeduction > 0
                    ? `(${breakdown.overseasExpScore + breakdown.australianExpScore} raw pts capped to 20)`
                    : undefined,
              },
              { label: "Educational Qualification", earned: breakdown.qualificationScore, max: 20, icon: "🎓" },
              { label: "Specialist Education (STEM/ICT Research)", earned: breakdown.specialistEducationScore, max: 10, icon: "🔬" },
              { label: "Australian Study Requirement", earned: breakdown.australianStudyScore, max: 5, icon: "🏫" },
              { label: "Professional Year in Australia", earned: breakdown.professionalYearScore, max: 5, icon: "👔" },
              { label: "Credentialled Community Language (NAATI)", earned: breakdown.communityLanguageScore, max: 5, icon: "🌐" },
              { label: "Study in Regional Australia", earned: breakdown.regionalStudyScore, max: 5, icon: "🏞️" },
              { label: "Partner Skills", earned: breakdown.partnerSkillsScore, max: 10, icon: "💍" },
            ].map((item) => {
              const pct = Math.min(100, (item.earned / item.max) * 100);
              const barColor =
                pct >= 75 ? "var(--color-strong)" : pct >= 40 ? "var(--color-moderate)" : pct > 0 ? "var(--color-weak)" : "#E2E8F0";

              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-800">{item.label}</span>
                      {item.extra && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {item.extra}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-600 tabular-nums">
                      {item.earned} / {item.max}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div
          className="rounded-xl p-4 mb-6 text-xs leading-relaxed"
          style={{
            backgroundColor: "var(--color-accent-bg)",
            color: "var(--color-text-muted)",
            borderLeft: "3px solid var(--color-primary)",
          }}
        >
          <strong style={{ color: "var(--color-text-main)" }}>Disclaimer:</strong> GSM scores are
          calculated based on the official Department of Home Affairs points table. Actual invitation
          cutoffs vary by invitation round, occupation demand, and state nomination criteria. This is
          indicative only and does not constitute immigration advice.
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onRecalculate}
            className="w-full py-4 px-6 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 border-2"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
              fontFamily: "var(--font-montserrat)",
            }}
          >
            ← Recalculate / Go Back
          </button>
          <button
            type="button"
            onClick={() => setShowPdfModal(true)}
            className="w-full py-4 px-6 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 text-white shadow-lg"
            style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
          >
            Print Official PDF Report
          </button>
        </div>

        {/* PDF Name Modal */}
        {showPdfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fadeInUp">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Generate GSM Report</h3>
              <p className="text-sm text-slate-500 mb-6">Enter the client&apos;s full name to generate an official GSM assessment document.</p>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-800 focus:outline-none mb-6 text-slate-800 bg-white"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePdf}
                  disabled={!clientName.trim()}
                  className="flex-1 py-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  Generate PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Fixed Background Watermark for PDF ── */}
      <div className="hidden print:block pdf-watermark-bg">
        <img src="/Logo W.png" alt="" aria-hidden="true" className="filter invert" />
      </div>

      {/* ── Printable Official PDF Document ── */}
      <div
        id="printable-gsm-pdf"
        className="hidden print:flex w-full bg-transparent text-slate-900 font-sans"
        style={{ printColorAdjust: "exact", flexDirection: "column" } as React.CSSProperties}
      >
        {/* PDF Header */}
        <div className="pdf-content-layer flex justify-between items-end border-b-4 border-slate-800 pb-4 mb-6 pt-2 print-avoid-break">
          <div className="flex flex-col">
            <img src="/Logo W.png" alt="MG Visa" className="h-10 object-contain filter invert mb-2 w-24" />
            <p className="text-base font-black text-slate-800 tracking-wider">MG International Visa Consultancy</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Cairo | Dubai | Zayed &nbsp;·&nbsp; Info@mg-visa.com</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Immigration Assessment</p>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-1">Australia Skilled Migration</h1>
            <p className="text-sm font-bold text-slate-600">General Skilled Migration (GSM) Report</p>
          </div>
        </div>

        {/* PDF Content */}
        <div className="print-content-flow">
          {/* Client Info Banner */}
          <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 print-avoid-break">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prepared For</p>
              <p className="text-lg font-black text-black">{clientName || "Client"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">
                <span className="font-semibold">Assessment Date:</span> {reportDate}
              </p>
              <p className="text-xs text-slate-500">
                <span className="font-semibold">Target Subclass:</span>{" "}
                <span className="font-black text-slate-900">
                  {form.subclass === "189"
                    ? "Subclass 189 (Independent)"
                    : form.subclass === "190"
                    ? "Subclass 190 (Nominated)"
                    : form.subclass === "491"
                    ? "Subclass 491 (Regional)"
                    : "Not specified"}
                </span>
              </p>
            </div>
          </div>

          {/* Score Summary Banner */}
          <div className="pdf-content-layer bg-slate-800 text-white rounded-lg px-5 py-4 mb-8 flex items-center justify-between print-avoid-break">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Total Points Earned</p>
              <p className="text-4xl font-black" style={{ color: status.color }}>
                {breakdown.total}
              </p>
              <p className="text-xs opacity-50 mt-0.5">Department of Home Affairs statutory cutoff: 65 points</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Assessment</p>
              <p className="text-xl font-black" style={{ color: status.color }}>
                {status.label}
              </p>
              <p className="text-xs opacity-50 mt-1 max-w-xs">{status.description}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="print-avoid-break mb-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
              Official Points Test Criteria Summary
            </h3>
            <table className="w-full text-xs border border-slate-200">
              <thead>
                <tr className="bg-slate-800 text-white font-bold">
                  <th className="p-2 text-left">Category / Criterion</th>
                  <th className="p-2 text-left">Candidate Claim</th>
                  <th className="p-2 text-right">Max</th>
                  <th className="p-2 text-right">Awarded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="p-2 font-semibold">Visa Subclass Nomination</td>
                  <td className="p-2">
                    {form.subclass === "189"
                      ? "Subclass 189 (Independent)"
                      : form.subclass === "190"
                      ? "Subclass 190 (State Nominated)"
                      : form.subclass === "491"
                      ? "Subclass 491 (Regional Nominated/Sponsored)"
                      : "Unselected"}
                  </td>
                  <td className="p-2 text-right">15</td>
                  <td className="p-2 text-right font-bold">{breakdown.subclassScore}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Age Bracket</td>
                  <td className="p-2">
                    {form.age === "18_24"
                      ? "18 to 24 years"
                      : form.age === "25_32"
                      ? "25 to 32 years"
                      : form.age === "33_39"
                      ? "33 to 39 years"
                      : form.age === "40_44"
                      ? "40 to 44 years"
                      : form.age === "45_plus"
                      ? "45+ years (ineligible)"
                      : "Unselected"}
                  </td>
                  <td className="p-2 text-right">30</td>
                  <td className="p-2 text-right font-bold">{breakdown.ageScore}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">English Language Proficiency</td>
                  <td className="p-2 capitalize">{form.english ? `${form.english} English` : "Unselected"}</td>
                  <td className="p-2 text-right">20</td>
                  <td className="p-2 text-right font-bold">{breakdown.englishScore}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Overseas Skilled Employment</td>
                  <td className="p-2">
                    {form.overseasExp === "less_than_3"
                      ? "< 3 years"
                      : form.overseasExp === "3_4_years"
                      ? "3 to 4 years"
                      : form.overseasExp === "5_7_years"
                      ? "5 to 7 years"
                      : form.overseasExp === "8_plus_years"
                      ? "8+ years"
                      : "Unselected"}
                  </td>
                  <td className="p-2 text-right">15</td>
                  <td className="p-2 text-right font-bold">{breakdown.overseasExpScore}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Australian Skilled Employment</td>
                  <td className="p-2">
                    {form.australianExp === "less_than_1"
                      ? "< 1 year"
                      : form.australianExp === "1_2_years"
                      ? "1 to 2 years"
                      : form.australianExp === "3_4_years"
                      ? "3 to 4 years"
                      : form.australianExp === "5_7_years"
                      ? "5 to 7 years"
                      : form.australianExp === "8_plus_years"
                      ? "8+ years"
                      : "Unselected"}
                  </td>
                  <td className="p-2 text-right">20</td>
                  <td className="p-2 text-right font-bold">{breakdown.australianExpScore}</td>
                </tr>
                {breakdown.employmentCappedDeduction > 0 && (
                  <tr className="bg-amber-50 text-amber-900">
                    <td className="p-2 italic" colSpan={2}>
                      Combined Employment Cap Adjustment (overseas + Australian capped at 20)
                    </td>
                    <td className="p-2 text-right">20 cap</td>
                    <td className="p-2 text-right font-bold">-{breakdown.employmentCappedDeduction}</td>
                  </tr>
                )}
                <tr>
                  <td className="p-2 font-semibold">Educational Qualification</td>
                  <td className="p-2">
                    {form.qualification === "doctorate"
                      ? "Doctorate / PhD"
                      : form.qualification === "bachelor_master"
                      ? "Bachelor or Master's Degree"
                      : form.qualification === "diploma_trade" || form.qualification === "recognized_award"
                      ? "Australian Diploma / Trade / Recognized Award"
                      : form.qualification === "none"
                      ? "None"
                      : "Unselected"}
                  </td>
                  <td className="p-2 text-right">20</td>
                  <td className="p-2 text-right font-bold">{breakdown.qualificationScore}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Specialist STEM / ICT Research Degree</td>
                  <td className="p-2">{form.specialistEducation === true ? "Yes" : "No"}</td>
                  <td className="p-2 text-right">10</td>
                  <td className="p-2 text-right font-bold">{breakdown.specialistEducationScore}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Australian Study Requirement</td>
                  <td className="p-2">{form.australianStudy === true ? "Yes" : "No"}</td>
                  <td className="p-2 text-right">5</td>
                  <td className="p-2 text-right font-bold">{breakdown.australianStudyScore}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Professional Year in Australia</td>
                  <td className="p-2">{form.professionalYear === true ? "Yes" : "No"}</td>
                  <td className="p-2 text-right">5</td>
                  <td className="p-2 text-right font-bold">{breakdown.professionalYearScore}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Credentialled Community Language (NAATI CCL)</td>
                  <td className="p-2">{form.communityLanguage === true ? "Yes" : "No"}</td>
                  <td className="p-2 text-right">5</td>
                  <td className="p-2 text-right font-bold">{breakdown.communityLanguageScore}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Study in Regional Australia</td>
                  <td className="p-2">{form.regionalStudy === true ? "Yes" : "No"}</td>
                  <td className="p-2 text-right">5</td>
                  <td className="p-2 text-right font-bold">{breakdown.regionalStudyScore}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold">Partner Skills</td>
                  <td className="p-2">
                    {form.partnerSkills === "single_or_citizen"
                      ? "Single OR Partner is Aus Citizen/PR"
                      : form.partnerSkills === "partner_skills_english"
                      ? "Partner with Competent English + Skills"
                      : form.partnerSkills === "partner_english_only"
                      ? "Partner with Competent English only"
                      : "None of the above"}
                  </td>
                  <td className="p-2 text-right">10</td>
                  <td className="p-2 text-right font-bold">{breakdown.partnerSkillsScore}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                  <td className="p-2.5 text-slate-900" colSpan={2}>
                    TOTAL GENERAL SKILLED MIGRATION POINTS
                  </td>
                  <td className="p-2.5 text-right text-slate-500">65 min</td>
                  <td className="p-2.5 text-right text-base text-slate-900">{breakdown.total}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legal / Department of Home Affairs Disclaimer */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[10px] text-slate-500 leading-relaxed print-avoid-break">
            <strong className="text-slate-700">Official Disclaimer:</strong> Points calculated above
            reflect the Department of Home Affairs General Skilled Migration (GSM) points table.
            Achieving 65 points establishes statutory eligibility to lodge an Expression of Interest
            (EOI) via SkillSelect, but does not guarantee an Invitation to Apply (ITA). State
            nominations have distinct occupation lists, employment criteria, and invitation rounds.
            For full case evaluation, please contact MG International Visa Consultancy.
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Interactive Component with Auto-Scroll & View Switching
// ─────────────────────────────────────────────────────────────────
export default function AustraliaGSMForm() {
  const [form, setForm] = useState<FormState>(DEFAULT_AUSTRALIA_GSM_FORM);
  const [step, setStep] = useState<"form" | "results">("form");
  const [breakdown, setBreakdown] = useState<AustraliaGSMBreakdown | null>(null);

  // 12 Card Refs for ultra-smooth sequential auto-advance
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  // Live score updated on every change
  const liveBreakdown: AustraliaGSMBreakdown = calculateAustraliaGSM(form);

  // ── Auto-scroll handler on option selection with 300ms delay ────
  function handleSelectAndAutoScroll<K extends keyof FormState>(
    cardIndex: number,
    key: K,
    value: FormState[K]
  ) {
    const updatedForm = { ...form, [key]: value };
    setForm(updatedForm);

    // Apply 300ms delay to allow user to see selection state change smoothly
    setTimeout(() => {
      let nextUnansweredIdx = -1;

      // Scan forward from cardIndex + 1 to 11
      for (let i = cardIndex + 1; i < 12; i++) {
        if (!isCardAnswered(i, updatedForm)) {
          nextUnansweredIdx = i;
          break;
        }
      }

      // If not found forward, wrap around from 0 to cardIndex - 1
      if (nextUnansweredIdx === -1) {
        for (let i = 0; i < cardIndex; i++) {
          if (!isCardAnswered(i, updatedForm)) {
            nextUnansweredIdx = i;
            break;
          }
        }
      }

      if (nextUnansweredIdx !== -1 && cardRefs.current[nextUnansweredIdx]) {
        cardRefs.current[nextUnansweredIdx]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        // All 12 cards answered! Center the Calculate Official Score button
        submitBtnRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);
  }

  function handleSubmit() {
    const result = calculateAustraliaGSM(form);
    setBreakdown(result);
    // Instant unmount of the form & mount of the Results Dashboard
    setStep("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRecalculate() {
    setStep("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // If in results mode, render the dedicated Results Dashboard view
  if (step === "results" && breakdown) {
    return (
      <AustraliaGSMResultsView
        form={form}
        breakdown={breakdown}
        onRecalculate={handleRecalculate}
      />
    );
  }

  // ── Form View with Live Score Badge and Auto-Scrolling Cards ───
  return (
    <>
      {/* ── Fixed Real-Time Header Badge (Top-4 Left-4) ── */}
      <div
        id="live-gsm-badge"
        aria-live="polite"
        className="fixed top-4 left-4 z-50 flex flex-col items-start"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-md transition-all duration-300"
          style={{
            backgroundColor: liveBreakdown.total >= 65 ? "#16A34A" : "#283840",
            minWidth: "155px",
          }}
        >
          <p
            className="text-[9px] font-bold uppercase tracking-widest mb-0.5 text-white/70"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Live GSM Score
          </p>
          <p
            className="text-xl sm:text-2xl font-extrabold leading-none text-white tabular-nums"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {liveBreakdown.total}
            <span className="text-[10px] font-semibold ml-1.5 text-white/75">
              {liveBreakdown.total >= 65 ? "Points (Passing)" : "Points (< 65)"}
            </span>
          </p>
        </div>
      </div>

      <div className="animate-fadeInUp">
        {/* Intro */}
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3"
            style={{
              backgroundColor: "var(--color-accent-bg)",
              color: "var(--color-accent)",
              border: "1px solid var(--color-accent-border)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent-hover)" }} />
            🇦🇺 Australia Skilled Migration
          </div>
          <h2
            className="text-2xl sm:text-3xl font-bold leading-tight mb-2"
            style={{ color: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
          >
            General Skilled Migration (GSM) Points Calculator
          </h2>
          <p className="text-sm leading-relaxed text-slate-500">
            Calculate your points for Subclasses 189, 190, and 491 under the official Department of
            Home Affairs points test. As you select each answer, the page automatically advances to
            the next criterion. Passing cutoff is <strong>65 points</strong>.
          </p>
        </div>

        {/* ── 01. Visa Subclass ── */}
        <section
          ref={(el) => { cardRefs.current[0] = el; }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 transition-all duration-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-xl shrink-0">
                🇦🇺
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#283840]/60">
                  Criterion 01 / 12
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#283840]" style={{ fontFamily: "var(--font-montserrat)" }}>
                  Visa Subclass & Nomination
                </h3>
              </div>
            </div>
            {form.subclass && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {liveBreakdown.subclassScore} pts
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Select the visa subclass you intend to apply for. State/territory nomination or family sponsorship grants additional points.
          </p>
          <div className="flex flex-col gap-2.5">
            {GSM_SUBCLASS_OPTIONS.map((opt) => (
              <RadioOptionCard
                key={opt.value}
                option={opt}
                isSelected={form.subclass === opt.value}
                onSelect={(val) => handleSelectAndAutoScroll(0, "subclass", val)}
                name="subclass"
              />
            ))}
          </div>
        </section>

        {/* ── 02. Age ── */}
        <section
          ref={(el) => { cardRefs.current[1] = el; }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 transition-all duration-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-xl shrink-0">
                🧑
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#283840]/60">
                  Criterion 02 / 12
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#283840]" style={{ fontFamily: "var(--font-montserrat)" }}>
                  Age Bracket
                </h3>
              </div>
            </div>
            {form.age && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {liveBreakdown.ageScore} pts
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Points are calculated on the date an invitation is issued. Applicants aged 45 or older are ineligible to receive an invitation.
          </p>
          <div className="flex flex-col gap-2.5">
            {GSM_AGE_OPTIONS.map((opt) => (
              <RadioOptionCard
                key={opt.value}
                option={opt}
                isSelected={form.age === opt.value}
                onSelect={(val) => handleSelectAndAutoScroll(1, "age", val)}
                name="age"
              />
            ))}
          </div>
        </section>

        {/* ── 03. English Language Ability ── */}
        <section
          ref={(el) => { cardRefs.current[2] = el; }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 transition-all duration-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-xl shrink-0">
                🗣️
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#283840]/60">
                  Criterion 03 / 12
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#283840]" style={{ fontFamily: "var(--font-montserrat)" }}>
                  English Language Proficiency
                </h3>
              </div>
            </div>
            {form.english && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {liveBreakdown.englishScore} pts
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Test results (IELTS, PTE Academic, Cambridge C1) must have been completed within 3 years of invitation date.
          </p>
          <div className="flex flex-col gap-2.5">
            {GSM_ENGLISH_OPTIONS.map((opt) => (
              <RadioOptionCard
                key={opt.value}
                option={opt}
                isSelected={form.english === opt.value}
                onSelect={(val) => handleSelectAndAutoScroll(2, "english", val)}
                name="english"
              />
            ))}
          </div>
        </section>

        {/* ── 04. Overseas Skilled Employment ── */}
        <section
          ref={(el) => { cardRefs.current[3] = el; }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 transition-all duration-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-xl shrink-0">
                🌍
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#283840]/60">
                  Criterion 04 / 12
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#283840]" style={{ fontFamily: "var(--font-montserrat)" }}>
                  Overseas Skilled Employment (Outside Australia)
                </h3>
              </div>
            </div>
            {form.overseasExp && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {liveBreakdown.overseasExpScore} pts
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Skilled work outside Australia in your nominated or closely related occupation in the last 10 years.
          </p>
          <div className="flex flex-col gap-2.5">
            {GSM_OVERSEAS_EXP_OPTIONS.map((opt) => (
              <RadioOptionCard
                key={opt.value}
                option={opt}
                isSelected={form.overseasExp === opt.value}
                onSelect={(val) => handleSelectAndAutoScroll(3, "overseasExp", val)}
                name="overseasExp"
              />
            ))}
          </div>
          {liveBreakdown.overseasExpScore + liveBreakdown.australianExpScore > 20 && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <span className="text-sm">⚡</span>
              <span>
                <strong>Home Affairs 20-Point Cap Applied:</strong> Combined overseas ({liveBreakdown.overseasExpScore} pts) and Australian ({liveBreakdown.australianExpScore} pts) employment is strictly capped at <strong>20 points maximum</strong>.
              </span>
            </div>
          )}
        </section>

        {/* ── 05. Australian Skilled Employment ── */}
        <section
          ref={(el) => { cardRefs.current[4] = el; }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 transition-all duration-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-xl shrink-0">
                💼
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#283840]/60">
                  Criterion 05 / 12
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#283840]" style={{ fontFamily: "var(--font-montserrat)" }}>
                  Australian Skilled Employment (In Australia)
                </h3>
              </div>
            </div>
            {form.australianExp && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {liveBreakdown.australianExpScore} pts
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Skilled employment inside Australia in your nominated or closely related occupation in the last 10 years.
          </p>
          <div className="flex flex-col gap-2.5">
            {GSM_AUSTRALIAN_EXP_OPTIONS.map((opt) => (
              <RadioOptionCard
                key={opt.value}
                option={opt}
                isSelected={form.australianExp === opt.value}
                onSelect={(val) => handleSelectAndAutoScroll(4, "australianExp", val)}
                name="australianExp"
              />
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-400 italic">
            * Combined points for Overseas and Australian skilled employment are strictly capped at 20 points.
          </p>
        </section>

        {/* ── 06. Educational Qualifications ── */}
        <section
          ref={(el) => { cardRefs.current[5] = el; }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 transition-all duration-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-xl shrink-0">
                🎓
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#283840]/60">
                  Criterion 06 / 12
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#283840]" style={{ fontFamily: "var(--font-montserrat)" }}>
                  Educational Qualifications
                </h3>
              </div>
            </div>
            {form.qualification && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {liveBreakdown.qualificationScore} pts
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Select your highest completed qualification from an Australian institution or recognized overseas equivalent standard.
          </p>
          <div className="flex flex-col gap-2.5">
            {GSM_QUALIFICATION_OPTIONS.map((opt) => (
              <RadioOptionCard
                key={opt.value}
                option={opt}
                isSelected={form.qualification === opt.value}
                onSelect={(val) => handleSelectAndAutoScroll(5, "qualification", val)}
                name="qualification"
              />
            ))}
          </div>
        </section>

        {/* ── 07. Specialist Education Qualification ── */}
        <section
          ref={(el) => { cardRefs.current[6] = el; }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 transition-all duration-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-xl shrink-0">
                🔬
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#283840]/60">
                  Criterion 07 / 12
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#283840]" style={{ fontFamily: "var(--font-montserrat)" }}>
                  Specialist Education Qualification (STEM / ICT)
                </h3>
              </div>
            </div>
            {form.specialistEducation !== null && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {liveBreakdown.specialistEducationScore} pts
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Australian Master&apos;s by research or PhD in Science, Technology, Engineering, Mathematics (STEM) or Information and Communication Technology (ICT) involving at least 2 academic years of study.
          </p>
          <BinaryRadio
            label="STEM / ICT Master's by research or PhD in Australia"
            description="At least 2 academic years of study in eligible STEM/ICT disciplines"
            points={10}
            value={form.specialistEducation}
            onChange={(v) => handleSelectAndAutoScroll(6, "specialistEducation", v)}
            name="specialistEducation"
          />
        </section>

        {/* ── 08. Australian Study Requirement ── */}
        <section
          ref={(el) => { cardRefs.current[7] = el; }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 transition-all duration-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-xl shrink-0">
                🏫
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#283840]/60">
                  Criterion 08 / 12
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#283840]" style={{ fontFamily: "var(--font-montserrat)" }}>
                  Australian Study Requirement
                </h3>
              </div>
            </div>
            {form.australianStudy !== null && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {liveBreakdown.australianStudyScore} pts
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Completed at least 1 degree, diploma, or trade qualification from an Australian institution taking at least 2 academic years (92 weeks) of study on CRICOS.
          </p>
          <BinaryRadio
            label="Completed 2+ Academic Years in Australia"
            description="Studied in English while physically present in Australia"
            points={5}
            value={form.australianStudy}
            onChange={(v) => handleSelectAndAutoScroll(7, "australianStudy", v)}
            name="australianStudy"
          />
        </section>

        {/* ── 09. Professional Year in Australia ── */}
        <section
          ref={(el) => { cardRefs.current[8] = el; }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 transition-all duration-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-xl shrink-0">
                👔
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#283840]/60">
                  Criterion 09 / 12
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#283840]" style={{ fontFamily: "var(--font-montserrat)" }}>
                  Professional Year in Australia
                </h3>
              </div>
            </div>
            {form.professionalYear !== null && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {liveBreakdown.professionalYearScore} pts
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Completed an approved 12-month Professional Year program in Accounting, ICT, or Engineering within the 48 months before invitation.
          </p>
          <BinaryRadio
            label="Completed Professional Year Program in Australia"
            description="Approved 12-month program in Accounting, Engineering, or ICT"
            points={5}
            value={form.professionalYear}
            onChange={(v) => handleSelectAndAutoScroll(8, "professionalYear", v)}
            name="professionalYear"
          />
        </section>

        {/* ── 10. Credentialled Community Language ── */}
        <section
          ref={(el) => { cardRefs.current[9] = el; }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 transition-all duration-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-xl shrink-0">
                🌐
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#283840]/60">
                  Criterion 10 / 12
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#283840]" style={{ fontFamily: "var(--font-montserrat)" }}>
                  Credentialled Community Language (NAATI CCL)
                </h3>
              </div>
            </div>
            {form.communityLanguage !== null && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {liveBreakdown.communityLanguageScore} pts
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Accredited by NAATI at paraprofessional level or higher, or holds a Credentialled Community Language (CCL) pass.
          </p>
          <BinaryRadio
            label="NAATI Credentialled Community Language (CCL)"
            description="Passed NAATI CCL test or accredited translator/interpreter"
            points={5}
            value={form.communityLanguage}
            onChange={(v) => handleSelectAndAutoScroll(9, "communityLanguage", v)}
            name="communityLanguage"
          />
        </section>

        {/* ── 11. Study in Regional Australia ── */}
        <section
          ref={(el) => { cardRefs.current[10] = el; }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 transition-all duration-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-xl shrink-0">
                🏞️
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#283840]/60">
                  Criterion 11 / 12
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#283840]" style={{ fontFamily: "var(--font-montserrat)" }}>
                  Study in Regional Australia
                </h3>
              </div>
            </div>
            {form.regionalStudy !== null && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {liveBreakdown.regionalStudyScore} pts
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Met the Australian study requirement while living and studying in a designated regional area (outside Sydney, Melbourne, Brisbane).
          </p>
          <BinaryRadio
            label="Studied and Lived in Regional Australia"
            description="Campus and residence both located in designated regional postcodes"
            points={5}
            value={form.regionalStudy}
            onChange={(v) => handleSelectAndAutoScroll(10, "regionalStudy", v)}
            name="regionalStudy"
          />
        </section>

        {/* ── 12. Partner Skills ── */}
        <section
          ref={(el) => { cardRefs.current[11] = el; }}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 transition-all duration-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-xl shrink-0">
                💍
              </span>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#283840]/60">
                  Criterion 12 / 12
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#283840]" style={{ fontFamily: "var(--font-montserrat)" }}>
                  Partner Skills & Marital Status
                </h3>
              </div>
            </div>
            {form.partnerSkills && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {liveBreakdown.partnerSkillsScore} pts
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Points awarded for being single, having an Australian partner, or your spouse&apos;s English and skills assessment.
          </p>
          <div className="flex flex-col gap-2.5">
            {GSM_PARTNER_OPTIONS.map((opt) => (
              <RadioOptionCard
                key={opt.value}
                option={opt}
                isSelected={form.partnerSkills === opt.value}
                onSelect={(val) => handleSelectAndAutoScroll(11, "partnerSkills", val)}
                name="partnerSkills"
              />
            ))}
          </div>
        </section>

        {/* Disclaimer Callout */}
        <div
          className="rounded-xl p-4 mb-6 text-xs leading-relaxed"
          style={{
            backgroundColor: "var(--color-accent-bg)",
            color: "var(--color-text-muted)",
            borderLeft: "3px solid var(--color-accent)",
          }}
        >
          <strong style={{ color: "var(--color-text-main)" }}>Statutory Disclaimer:</strong> This
          assessment computes scores under the official Department of Home Affairs General Skilled
          Migration points matrix. Meeting 65 points is the statutory minimum to register an
          Expression of Interest (EOI) on SkillSelect. Actual invitation rounds depend on state
          allocations, occupation ceiling caps, and candidate competition.
        </div>

        {/* ── View-Switching Submission Button ── */}
        <div className="pt-2 pb-8">
          <button
            ref={submitBtnRef}
            type="button"
            onClick={handleSubmit}
            className="w-full py-4 px-8 rounded-2xl font-bold text-base tracking-wide transition-all duration-300 flex items-center justify-center gap-3 text-white shadow-xl hover:opacity-95 hover:shadow-2xl cursor-pointer"
            style={{
              backgroundColor: "var(--color-primary)",
              fontFamily: "var(--font-montserrat)",
            }}
          >
            <span>🇦🇺</span>
            Calculate Official Score ({liveBreakdown.total} Points)
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 ml-1"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
