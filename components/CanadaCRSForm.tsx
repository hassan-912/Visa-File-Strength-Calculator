"use client";

import { useState, useEffect } from "react";
import {
  calculateCRS,
  DEFAULT_CRS_FORM,
  AGE_OPTIONS,
  EDUCATION_OPTIONS,
  LANG1_OPTIONS,
  LANG2_OPTIONS,
  CAN_WORK_EXP_OPTIONS,
  SPOUSE_LANG1_OPTIONS,
  FOREIGN_WORK_EXP_OPTIONS,
  FRENCH_CLB_OPTIONS,
  POST_SECONDARY_CANADA_OPTIONS,
  ARRANGED_EMPLOYMENT_OPTIONS,
} from "@/lib/canada-crs";
import type { CRSForm, CRSBreakdown } from "@/lib/canada-crs";

// ─────────────────────────────────────────────────────────────────
// Tiny reusable components
// ─────────────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="h-px flex-1" style={{ background: "linear-gradient(to right, var(--color-accent), transparent)" }} />
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
        {label}
      </span>
      <div className="h-px flex-1" style={{ background: "linear-gradient(to left, var(--color-accent), transparent)" }} />
    </div>
  );
}

interface RadioGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}

function RadioGroup({ label, name, options, value, onChange, hint }: RadioGroupProps) {
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-text-main)", fontFamily: "var(--font-montserrat)" }}>
        {label}
      </p>
      {hint && <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>{hint}</p>}
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => {
          const isChecked = value === opt.value;
          return (
            <label
              key={opt.value}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-all duration-150"
              style={{
                backgroundColor: isChecked ? "var(--color-accent-bg)" : "var(--color-surface-2)",
                borderColor: isChecked ? "var(--color-primary)" : "var(--color-border-light)",
              }}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isChecked}
                onChange={() => onChange(opt.value)}
                className="sr-only"
              />
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150"
                style={{
                  borderColor: isChecked ? "var(--color-primary)" : "var(--color-border)",
                  backgroundColor: isChecked ? "var(--color-primary)" : "transparent",
                }}
              >
                {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <span
                className="text-sm leading-snug"
                style={{
                  color: isChecked ? "var(--color-primary)" : "var(--color-text-body)",
                  fontWeight: isChecked ? "600" : "400",
                }}
              >
                {opt.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

interface SelectGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}

function SelectGroup({ label, name, options, value, onChange }: SelectGroupProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-semibold mb-1.5"
        style={{ color: "var(--color-text-main)", fontFamily: "var(--font-montserrat)" }}
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border-2 text-sm transition-all duration-150"
        style={{
          borderColor: value ? "var(--color-primary)" : "var(--color-border-light)",
          backgroundColor: "var(--color-surface)",
          color: value ? "var(--color-text-main)" : "var(--color-text-muted)",
          fontFamily: "var(--font-montserrat)",
          outline: "none",
        }}
      >
        <option value="" disabled>Select…</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

interface CheckboxItemProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}

function CheckboxItem({ label, description, checked, onChange, id }: CheckboxItemProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-150 mb-2"
      style={{
        backgroundColor: checked ? "var(--color-accent-bg)" : "var(--color-surface-2)",
        borderColor: checked ? "var(--color-primary)" : "var(--color-border-light)",
      }}
    >
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <div
        className="mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150"
        style={{
          borderColor: checked ? "var(--color-primary)" : "var(--color-border)",
          backgroundColor: checked ? "var(--color-primary)" : "transparent",
        }}
      >
        {checked && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white" className="w-3 h-3">
            <path fillRule="evenodd" d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: checked ? "var(--color-primary)" : "var(--color-text-main)" }}>
          {label}
        </p>
        {description && (
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
            {description}
          </p>
        )}
      </div>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────
// Accordion section wrapper
// ─────────────────────────────────────────────────────────────────
interface AccordionSectionProps {
  stepNum: number;
  title: string;
  icon: string;
  isOpen: boolean;
  isComplete: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionSection({ stepNum, title, icon, isOpen, isComplete, onToggle, children }: AccordionSectionProps) {
  return (
    <div
      className="rounded-2xl border mb-3 overflow-hidden transition-all duration-200"
      style={{
        borderColor: isComplete ? "var(--color-primary)" : isOpen ? "var(--color-accent-border)" : "var(--color-border-light)",
        backgroundColor: "var(--color-surface)",
        boxShadow: isOpen ? "0 4px 20px rgba(40,56,64,0.10)" : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        onClick={onToggle}
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl text-base font-bold shrink-0 transition-all"
          style={{
            backgroundColor: isComplete ? "var(--color-primary)" : isOpen ? "var(--color-accent-bg)" : "var(--color-surface-2)",
            color: isComplete ? "#fff" : "var(--color-primary)",
            fontFamily: "var(--font-montserrat)",
          }}
        >
          {isComplete ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            icon
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--color-text-muted)" }}>
            Step {stepNum}
          </p>
          <p className="text-sm font-bold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}>
            {title}
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 shrink-0 transition-transform duration-200"
          style={{ color: "var(--color-text-muted)", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Body */}
      {isOpen && (
        <div className="px-5 pb-6 border-t" style={{ borderColor: "var(--color-border-light)" }}>
          <div className="pt-5">{children}</div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CLB ability grid (4 abilities as dropdowns)
// ─────────────────────────────────────────────────────────────────

const ABILITIES: Array<{ key: keyof CRSForm; label: string }> = [
  { key: "lang1_reading",   label: "Reading" },
  { key: "lang1_writing",   label: "Writing" },
  { key: "lang1_speaking",  label: "Speaking" },
  { key: "lang1_listening", label: "Listening" },
];

const ABILITIES_LANG2: Array<{ key: keyof CRSForm; label: string }> = [
  { key: "lang2_reading",   label: "Reading" },
  { key: "lang2_writing",   label: "Writing" },
  { key: "lang2_speaking",  label: "Speaking" },
  { key: "lang2_listening", label: "Listening" },
];

const SPOUSE_ABILITIES: Array<{ key: keyof CRSForm; label: string }> = [
  { key: "spouse_lang1_reading",   label: "Reading" },
  { key: "spouse_lang1_writing",   label: "Writing" },
  { key: "spouse_lang1_speaking",  label: "Speaking" },
  { key: "spouse_lang1_listening", label: "Listening" },
];

// ─────────────────────────────────────────────────────────────────
// Results Dashboard
// ─────────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800) {
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

const BREAKDOWN_ITEMS: Array<{ key: keyof CRSBreakdown; label: string; maxPoints: number; icon: string }> = [
  { key: "ageScore",           label: "Age",                            maxPoints: 110, icon: "🧑" },
  { key: "educationScore",     label: "Education",                      maxPoints: 150, icon: "🎓" },
  { key: "lang1Score",         label: "Official Language 1",            maxPoints: 136, icon: "🗣️" },
  { key: "lang2Score",         label: "Official Language 2",            maxPoints: 24,  icon: "🌐" },
  { key: "canWorkExpScore",    label: "Canadian Work Experience",       maxPoints: 80,  icon: "💼" },
  { key: "spouseScore",        label: "Spouse / Partner Factors",       maxPoints: 40,  icon: "💍" },
  { key: "skillTransferScore", label: "Skill Transferability (max 100)",maxPoints: 100, icon: "⚡" },
  { key: "additionalScore",    label: "Additional Points (max 600)",    maxPoints: 600, icon: "🏆" },
];

function getCRSStatus(score: number) {
  if (score >= 470) return { label: "Competitive", color: "#16A34A", emoji: "🟢", sublabel: "Your CRS score is competitive for recent Express Entry draws." };
  if (score >= 380) return { label: "Moderate", color: "#EA580C", emoji: "🟡", sublabel: "Your profile has potential. Consider boosting language scores or gaining Canadian experience." };
  return { label: "Needs Improvement", color: "#DC2626", emoji: "🔴", sublabel: "Your current profile may need strengthening before applying. Consult an MG Visa advisor." };
}

interface ResultsProps {
  form: CRSForm;
  breakdown: CRSBreakdown;
  onEdit: () => void;
}

function CRSResults({ form, breakdown, onEdit }: ResultsProps) {
  const [barsVisible, setBarsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [clientName, setClientName] = useState("");
  const [reportDate, setReportDate] = useState("");

  const displayScore = useCountUp(breakdown.total, 1800);
  const status = getCRSStatus(breakdown.total);

  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  const handleGeneratePdf = () => {
    setReportDate(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
    setShowModal(false);
    setTimeout(() => window.print(), 100);
  };

  // Gauge
  const SIZE = 200, STROKE = 16, R = (SIZE - STROKE) / 2, C = SIZE / 2;
  const ARC_DEG = 220, GAP_DEG = 360 - ARC_DEG, START = 90 + GAP_DEG / 2;

  function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
    const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg)), y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg)),   y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }

  const trackD = arcPath(C, C, R, START, START + ARC_DEG);
  const fillEnd = START + (displayScore / 1200) * ARC_DEG;
  const fillD = displayScore > 0 ? arcPath(C, C, R, START, fillEnd) : "";

  return (
    <>
      {/* ── Screen Layout ── */}
      <div className="animate-fadeInUp print:hidden">
        {/* Hero card */}
        <div
          className="rounded-3xl overflow-hidden shadow-2xl mb-6"
          style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-mid) 100%)" }}
        >
          <div className="h-1" style={{ background: `linear-gradient(90deg, transparent, ${status.color}, transparent)` }} />
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Canada Express Entry — CRS Assessment
                </p>
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-montserrat)" }}>
                  Your CRS Score Result
                </h2>
              </div>
              <div
                className="flex items-center justify-center w-11 h-11 rounded-xl font-bold text-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#FFFFFF", fontFamily: "var(--font-montserrat)" }}
              >
                🍁
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Gauge */}
              <div className="shrink-0">
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-label={`CRS Score: ${breakdown.total} out of 1200`}>
                  <defs>
                    <linearGradient id="crsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={status.color} stopOpacity="0.5" />
                      <stop offset="100%" stopColor={status.color} stopOpacity="1" />
                    </linearGradient>
                    <filter id="crsGlow">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                  </defs>
                  <path d={trackD} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={STROKE} strokeLinecap="round" />
                  {displayScore > 0 && (
                    <path d={fillD} fill="none" stroke="url(#crsGrad)" strokeWidth={STROKE} strokeLinecap="round" filter="url(#crsGlow)" />
                  )}
                  <text x={C} y={C - 10} textAnchor="middle" dominantBaseline="middle" fontSize="38" fontWeight="800" fontFamily="Montserrat,sans-serif" fill={status.color}>
                    {displayScore}
                  </text>
                  <text x={C} y={C + 18} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="500" fontFamily="Montserrat,sans-serif" fill="rgba(255,255,255,0.35)">
                    out of 1,200
                  </text>
                </svg>
              </div>

              {/* Status */}
              <div className="flex-1 text-center sm:text-left">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-4"
                  style={{ backgroundColor: `${status.color}22`, border: `1.5px solid ${status.color}66`, color: status.color }}
                >
                  <span>{status.emoji}</span>
                  <span style={{ fontFamily: "var(--font-montserrat)" }}>{status.label}</span>
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {status.sublabel}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Core Factors", value: breakdown.ageScore + breakdown.educationScore + breakdown.lang1Score + breakdown.lang2Score + breakdown.canWorkExpScore },
                    { label: "Transferability", value: breakdown.skillTransferScore },
                    { label: "Total CRS", value: breakdown.total, highlight: true },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                      <p className="text-[11px] mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                      <p className="text-base font-bold" style={{ color: s.highlight ? status.color : "#FFFFFF", fontFamily: "var(--font-montserrat)" }}>
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown bars */}
        <div
          className="rounded-2xl border p-6 mb-5 shadow-sm"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border-light)" }}
        >
          <h3 className="text-base font-bold mb-5" style={{ color: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}>
            CRS Score Breakdown
          </h3>
          <div className="space-y-4">
            {BREAKDOWN_ITEMS.map((item, idx) => {
              const earned = breakdown[item.key] as number;
              const pct = item.maxPoints > 0 ? Math.min(100, (earned / item.maxPoints) * 100) : 0;
              const barColor = pct >= 70 ? "var(--color-strong)" : pct >= 40 ? "var(--color-moderate)" : pct > 0 ? "var(--color-weak)" : "var(--color-border)";
              return (
                <div key={item.key} style={{ animationDelay: `${idx * 80}ms` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-sm font-semibold" style={{ color: "var(--color-text-main)" }}>{item.label}</span>
                    </div>
                    <span className="text-xs font-bold tabular-nums" style={{ color: "var(--color-text-muted)" }}>
                      {earned} / {item.maxPoints}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface-3)" }}>
                    <div
                      className="h-full rounded-full transition-all ease-out"
                      style={{ width: barsVisible ? `${pct}%` : "0%", transitionDuration: `${600 + idx * 100}ms`, backgroundColor: barColor }}
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
          style={{ backgroundColor: "var(--color-accent-bg)", color: "var(--color-text-muted)", borderLeft: "3px solid var(--color-primary)" }}
        >
          <strong style={{ color: "var(--color-text-main)" }}>Disclaimer:</strong>{" "}
          CRS scores are calculated based on IRCC&apos;s official grid. Actual draw cut-offs vary. This is indicative only and does not constitute immigration advice.
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onEdit}
            className="w-full py-4 px-6 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 border-2"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-primary)", color: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
          >
            ← Edit Profile
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="w-full py-4 px-6 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 text-white shadow-lg"
            style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
          >
            Generate CRS Report PDF
          </button>
        </div>

        {/* PDF Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fadeInUp">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Generate CRS Report</h3>
              <p className="text-sm text-slate-500 mb-6">Enter the client&apos;s full name to generate an official CRS assessment document.</p>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-800 focus:outline-none mb-6 text-slate-800 bg-white"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
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

      {/* ── Print Layout — IRCC-Style, Isolated from Tourism PDF ── */}
      {/*
        Uses id="printable-crs-pdf" (NOT printable-pdf-area) so that:
        - The Tourism @media print rule does NOT accidentally reveal this block.
        - globals.css targets both IDs independently.
        - Content flows naturally across A4 pages (no max-height clip).
      */}
      {/* ── Fixed Background Watermark — z-index below all content ── */}
      <div className="hidden print:block pdf-watermark-bg">
        <img src="/Logo W.png" alt="" aria-hidden="true" className="filter invert" />
      </div>

      <table
        id="printable-crs-pdf"
        className="hidden print:table w-full bg-transparent text-slate-900 font-sans border-collapse m-0 p-0"
        style={{ printColorAdjust: "exact" } as React.CSSProperties}
      >
        {/* ── Repeating Header ── */}
        <thead className="print-table-header">
          <tr>
            <td>
              <div className="pdf-content-layer flex justify-between items-end border-b-4 border-slate-800 pb-4 mb-6 pt-2">
                <div className="flex flex-col">
                  <img src="/Logo W.png" alt="MG Visa" className="h-10 object-contain filter invert mb-2 w-24" />
                  <p className="text-base font-black text-slate-800 tracking-wider">MG International Visa Consultancy</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Cairo | Dubai | Zayed &nbsp;·&nbsp; Info@mg-visa.com</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Immigration Assessment</p>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-widest mb-1">Canada Express Entry</h1>
                  <p className="text-sm font-bold text-slate-600">Comprehensive Ranking System (CRS) Report</p>
                </div>
              </div>
            </td>
          </tr>
        </thead>

        {/* ── Main Content Body ── */}
        <tbody>
          <tr>
            <td>
              <div className="print-content-flow">
                {/* ── Client Info Banner (First Page Only) ── */}
                <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prepared For</p>
                    <p className="text-lg font-black text-black">{clientName || "Client"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">
                      <span className="font-semibold">Assessment Date:</span> {reportDate}
                    </p>
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold">Total CRS Score:</span> <span className="font-black text-slate-900">{breakdown.total} / 1,200</span>
                    </p>
                  </div>
                </div>

        {/* ── Score Summary Banner ── */}
        <div className="pdf-content-layer bg-slate-800 text-white rounded-lg px-5 py-4 mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Total CRS Score</p>
            <p className="text-4xl font-black" style={{ color: getCRSStatus(breakdown.total).color }}>{breakdown.total}</p>
            <p className="text-xs opacity-50 mt-0.5">out of 1,200 maximum points</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Assessment</p>
            <p className="text-xl font-black" style={{ color: getCRSStatus(breakdown.total).color }}>
              {getCRSStatus(breakdown.total).label}
            </p>
            <p className="text-xs opacity-50 mt-1 max-w-xs">{getCRSStatus(breakdown.total).sublabel}</p>
          </div>
        </div>

        {/* ── Helper for section tables ── */}
        {[
          {
            section: "A",
            title: "Core / Human Capital Factors",
            subtitle: "Scored on a per-applicant basis (single or with spouse scale)",
            rows: [
              { label: "Age", max: 110, earned: breakdown.ageScore },
              { label: "Education Level", max: 150, earned: breakdown.educationScore },
              { label: "Official Language 1 (4 abilities × CLB scale)", max: 136, earned: breakdown.lang1Score },
              { label: "Official Language 2 (4 abilities × CLB scale)", max: 24, earned: breakdown.lang2Score },
              { label: "Canadian Work Experience", max: 80, earned: breakdown.canWorkExpScore },
            ],
          },
          ...(form.withSpouse ? [{
            section: "B",
            title: "Spouse / Common-Law Partner Factors",
            subtitle: "Applicable only when applying with an accompanying partner",
            rows: [
              { label: "Spouse Education Level", max: 10, earned: breakdown.spouseScore > 0 ? Math.min(10, breakdown.spouseScore) : 0 },
              { label: "Spouse Official Language 1 (4 abilities)", max: 20, earned: 0 },
              { label: "Spouse Canadian Work Experience", max: 10, earned: 0 },
            ],
          }] : []),
          {
            section: form.withSpouse ? "C" : "B",
            title: "Skill Transferability Factors",
            subtitle: "Combinations of education, language & experience (capped at 100 pts)",
            rows: [
              { label: "Skill Transferability (combined sub-factors)", max: 100, earned: breakdown.skillTransferScore },
            ],
          },
          {
            section: form.withSpouse ? "D" : "C",
            title: "Additional Points",
            subtitle: "Sibling in Canada, French bonus, arranged employment, provincial nomination (capped at 600 pts)",
            rows: [
              { label: "Additional Points (combined sub-factors)", max: 600, earned: breakdown.additionalScore },
            ],
          },
        ].map((sec) => {
          const secTotal = sec.rows.reduce((s, r) => s + r.earned, 0);
          const secMax = sec.rows.reduce((s, r) => s + r.max, 0);
          return (
            <div key={sec.section} className="pdf-content-layer print-avoid-break mb-7">
              {/* Section header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-7 h-7 rounded bg-slate-800 text-white text-xs font-black shrink-0">
                  {sec.section}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 uppercase tracking-wide">{sec.title}</p>
                  <p className="text-[10px] text-slate-400">{sec.subtitle}</p>
                </div>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr style={{ backgroundColor: "#283840", color: "white" }}>
                    <th className="py-2 px-3 text-xs font-bold uppercase tracking-wider w-1/2">Factor</th>
                    <th className="py-2 px-3 text-xs font-bold uppercase tracking-wider text-center">Max</th>
                    <th className="py-2 px-3 text-xs font-bold uppercase tracking-wider text-center">Score</th>
                    <th className="py-2 px-3 text-xs font-bold uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.rows.map((row, i) => {
                    const pct = row.max > 0 ? (row.earned / row.max) * 100 : 0;
                    const status = pct === 100 ? "Full" : pct >= 70 ? "Strong" : pct >= 40 ? "Moderate" : row.earned === 0 ? "—" : "Low";
                    return (
                      <tr key={row.label} className={`border-b border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50"}`}>
                        <td className="py-2.5 px-3 text-xs font-semibold text-slate-800">{row.label}</td>
                        <td className="py-2.5 px-3 text-xs text-slate-500 text-center">{row.max}</td>
                        <td className="py-2.5 px-3 text-xs font-black text-slate-900 text-center">{row.earned}</td>
                        <td className="py-2.5 px-3 text-[10px] font-bold text-slate-400 uppercase text-right">{status}</td>
                      </tr>
                    );
                  })}
                  {/* Section sub-total */}
                  <tr style={{ backgroundColor: "#f1f5f9" }}>
                    <td className="py-2 px-3 text-xs font-black text-slate-700 uppercase">Section {sec.section} Sub-total</td>
                    <td className="py-2 px-3 text-xs font-bold text-slate-500 text-center">{secMax}</td>
                    <td className="py-2 px-3 text-xs font-black text-slate-900 text-center">{secTotal}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}

                {/* ── Grand Total ── */}
                <div className="pdf-content-layer flex justify-end mt-4 mb-2">
                  <div className="w-1/2 border-t-4 border-slate-800 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-black uppercase text-slate-900">Total CRS Score</span>
                      <span className="text-3xl font-black" style={{ color: getCRSStatus(breakdown.total).color }}>{breakdown.total}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-slate-400 font-semibold">Maximum possible</span>
                      <span className="text-xs font-bold text-slate-600">1,200 points</span>
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: getCRSStatus(breakdown.total).color }}>
                        {getCRSStatus(breakdown.total).label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* end .print-content-flow */}
            </td>
          </tr>
        </tbody>

        {/* ── Repeating Footer ── */}
        <tfoot className="print-table-footer">
          <tr>
            <td>
              <div className="pdf-content-layer border-t-2 border-slate-200 pt-3 mt-4 pb-2 flex justify-between items-end">
                <div className="text-left max-w-2xl">
                  <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase mb-1">
                    Confidential — Prepared for {clientName || "Client"}
                  </p>
                  <p className="text-[9px] text-slate-400 leading-relaxed">
                    This CRS assessment is indicative only and relies on the official IRCC Comprehensive Ranking System grid.
                    It does not constitute legal or immigration advice. For personalised guidance, contact an MG Visa licensed advisor.
                    <br/><strong>mg-visa.com</strong> · Info@mg-visa.com · 17621
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 mb-1">MG International Visa Consultancy</p>
                  <p className="text-[9px] text-slate-400">Page <span className="page-number"></span></p>
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Language ability grid
// ─────────────────────────────────────────────────────────────────

function LangAbilityGrid({
  title,
  abilities,
  options,
  form,
  onUpdate,
}: {
  title: string;
  abilities: Array<{ key: keyof CRSForm; label: string }>;
  options: { value: string; label: string }[];
  form: CRSForm;
  onUpdate: (key: keyof CRSForm, value: string) => void;
}) {
  return (
    <div className="mb-5">
      <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-main)", fontFamily: "var(--font-montserrat)" }}>
        {title}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {abilities.map(({ key, label }) => (
          <div key={String(key)}>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--color-text-muted)" }}>
              {label}
            </label>
            <select
              value={form[key] as string}
              onChange={(e) => onUpdate(key, e.target.value)}
              className="w-full px-3 py-2 rounded-xl border-2 text-sm transition-all duration-150"
              style={{
                borderColor: "var(--color-border-light)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text-main)",
                fontFamily: "var(--font-montserrat)",
                outline: "none",
              }}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Section completeness checks
// ─────────────────────────────────────────────────────────────────

function isCoreComplete(f: CRSForm) {
  return !!f.age && !!f.education;
}

function isSpouseComplete(f: CRSForm) {
  if (!f.withSpouse) return true;
  return !!f.spouse_education;
}

function isTransferComplete(_f: CRSForm) { return true; } // always defaults filled
function isAdditionalComplete(_f: CRSForm) { return true; } // always defaults filled

// ─────────────────────────────────────────────────────────────────
// Main Form Component
// ─────────────────────────────────────────────────────────────────

type AppStep = "form" | "results";

// Props kept for backwards compat — both are intentionally ignored in the
// new instant-results flow. Callers on the old tab-based page.tsx that still
// pass onCalculate / externalLoadingDone will compile without changes.
interface CanadaCRSFormProps {
  /** @deprecated — no longer used; results are instant */
  onCalculate?: () => void;
  /** @deprecated — no longer used; results are instant */
  externalLoadingDone?: boolean;
}

export default function CanadaCRSForm(_props: CanadaCRSFormProps = {}) {
  const [form, setForm] = useState<CRSForm>(DEFAULT_CRS_FORM);
  const [openSection, setOpenSection] = useState<number>(0);
  const [step, setStep] = useState<AppStep>("form");
  const [breakdown, setBreakdown] = useState<CRSBreakdown | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);

  // Profile section is step 0 — required before anything else
  useEffect(() => {
    setProfileComplete(form.withSpouse !== undefined);
  }, [form.withSpouse]);

  // ── Real-time live score (recalculated on every render) ──────────
  const liveScore = calculateCRS(form).total;

  function update(key: keyof CRSForm, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    const result = calculateCRS(form);
    setBreakdown(result);
    // Instant transition — no overlay, no artificial delay.
    setStep("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEdit() {
    setStep("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const canSubmit = isCoreComplete(form) && isSpouseComplete(form);

  if (step === "results" && breakdown) {
    return <CRSResults form={form} breakdown={breakdown} onEdit={handleEdit} />;
  }

  // ── Live score colour ──
  const liveBg  = liveScore >= 470 ? "#16A34A" : liveScore >= 380 ? "#EA580C" : "#283840";

  return (
    <>
      {/* ── Fixed real-time CRS badge (top-left) ── */}
      <div
        id="live-crs-badge"
        aria-live="polite"
        aria-label={`Live CRS Score: ${liveScore} out of 1200`}
        className="fixed z-50 flex flex-col items-start"
        style={{ top: "80px", left: "16px", pointerEvents: "none" }}
      >
        <div
          className="rounded-xl px-3 py-2 shadow-2xl"
          style={{
            backgroundColor: liveBg,
            transition: "background-color 0.4s ease",
            minWidth: "120px",
          }}
        >
          <p
            className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-montserrat)" }}
          >
            Live CRS Score
          </p>
          <p
            className="text-xl font-extrabold leading-none"
            style={{ color: "#FFFFFF", fontFamily: "var(--font-montserrat)" }}
          >
            {liveScore}
            <span
              className="text-[10px] font-semibold ml-1"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              / 1,200
            </span>
          </p>
        </div>
      </div>

    <div className="animate-fadeInUp">
      {/* Header */}
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3"
          style={{ backgroundColor: "var(--color-accent-bg)", color: "var(--color-accent)", border: "1px solid var(--color-accent-border)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent-hover)" }} />
          🍁 Canada Express Entry
        </div>
        <h2
          className="text-2xl sm:text-3xl font-bold leading-tight mb-2"
          style={{ color: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
        >
          CRS Score Calculator
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Complete all sections below. Your answers will be used to calculate your official Comprehensive Ranking System (CRS) score out of 1,200 points.
        </p>
      </div>

      {/* ── Step 0 — Profile ── */}
      <AccordionSection
        stepNum={1}
        title="Applicant Profile"
        icon="👤"
        isOpen={openSection === 0}
        isComplete={profileComplete}
        onToggle={() => setOpenSection(openSection === 0 ? -1 : 0)}
      >
        <RadioGroup
          label="Are you applying with an accompanying spouse or common-law partner?"
          name="withSpouse"
          options={[
            { value: "yes", label: "Yes — I have an accompanying spouse / common-law partner" },
            { value: "no",  label: "No — I am applying without a spouse / partner" },
          ]}
          value={form.withSpouse ? "yes" : "no"}
          onChange={(v) => update("withSpouse", v === "yes")}
          hint="This determines the scoring scale for all core human capital factors."
        />
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setOpenSection(1)}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
            style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
          >
            Next →
          </button>
        </div>
      </AccordionSection>

      {/* ── Step 1 — Core Factors ── */}
      <AccordionSection
        stepNum={2}
        title="Core / Human Capital Factors"
        icon="⚙️"
        isOpen={openSection === 1}
        isComplete={isCoreComplete(form)}
        onToggle={() => setOpenSection(openSection === 1 ? -1 : 1)}
      >
        <SelectGroup
          label="Age"
          name="age"
          options={AGE_OPTIONS}
          value={form.age}
          onChange={(v) => update("age", v)}
        />

        <SelectGroup
          label="Education Level"
          name="education"
          options={EDUCATION_OPTIONS}
          value={form.education}
          onChange={(v) => update("education", v)}
        />

        <SectionDivider label="First Official Language" />
        <p className="text-xs mb-3 -mt-2 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          Select your CLB level for each ability in your first official language (English or French).
        </p>
        <LangAbilityGrid
          title="First Official Language — CLB per ability"
          abilities={ABILITIES}
          options={LANG1_OPTIONS}
          form={form}
          onUpdate={update}
        />

        <SectionDivider label="Second Official Language" />
        <p className="text-xs mb-3 -mt-2 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          If you have test results in a second official language, enter your CLB level per ability.
        </p>
        <LangAbilityGrid
          title="Second Official Language — CLB per ability"
          abilities={ABILITIES_LANG2}
          options={LANG2_OPTIONS}
          form={form}
          onUpdate={update}
        />

        <SectionDivider label="Canadian Work Experience" />
        <SelectGroup
          label="How many years of skilled Canadian work experience do you have?"
          name="canWorkExp"
          options={CAN_WORK_EXP_OPTIONS}
          value={form.canWorkExp}
          onChange={(v) => update("canWorkExp", v)}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setOpenSection(form.withSpouse ? 2 : 3)}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
            style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
          >
            Next →
          </button>
        </div>
      </AccordionSection>

      {/* ── Step 2 — Spouse Factors (conditional) ── */}
      {form.withSpouse && (
        <AccordionSection
          stepNum={3}
          title="Spouse / Common-Law Partner Factors"
          icon="💍"
          isOpen={openSection === 2}
          isComplete={isSpouseComplete(form)}
          onToggle={() => setOpenSection(openSection === 2 ? -1 : 2)}
        >
          <SelectGroup
            label="Spouse's Education Level"
            name="spouse_education"
            options={EDUCATION_OPTIONS}
            value={form.spouse_education}
            onChange={(v) => update("spouse_education", v)}
          />

          <SectionDivider label="Spouse's First Official Language" />
          <LangAbilityGrid
            title="Spouse's CLB per ability"
            abilities={SPOUSE_ABILITIES}
            options={SPOUSE_LANG1_OPTIONS}
            form={form}
            onUpdate={update}
          />

          <SectionDivider label="Spouse's Canadian Work Experience" />
          <SelectGroup
            label="Spouse's years of skilled Canadian work experience"
            name="spouse_canWorkExp"
            options={CAN_WORK_EXP_OPTIONS}
            value={form.spouse_canWorkExp}
            onChange={(v) => update("spouse_canWorkExp", v)}
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setOpenSection(3)}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
              style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
            >
              Next →
            </button>
          </div>
        </AccordionSection>
      )}

      {/* ── Step 3 — Skill Transferability ── */}
      <AccordionSection
        stepNum={form.withSpouse ? 4 : 3}
        title="Skill Transferability Factors (max 100 pts)"
        icon="⚡"
        isOpen={openSection === 3}
        isComplete={isTransferComplete(form)}
        onToggle={() => setOpenSection(openSection === 3 ? -1 : 3)}
      >
        <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          These factors reward combinations of skills. Points are calculated automatically from your answers above plus the fields below.
        </p>

        <SelectGroup
          label="Foreign Work Experience outside Canada"
          name="foreignWorkExp"
          options={FOREIGN_WORK_EXP_OPTIONS}
          value={form.foreignWorkExp}
          onChange={(v) => update("foreignWorkExp", v)}
        />

        <CheckboxItem
          id="tradesCert"
          label="Certificate of Qualification in a trade occupation"
          description="Issued by a Canadian provincial or territorial authority."
          checked={form.tradesCertificate}
          onChange={(v) => update("tradesCertificate", v)}
        />

        <div className="flex justify-end mt-2">
          <button
            type="button"
            onClick={() => setOpenSection(4)}
            className="px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
            style={{ backgroundColor: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
          >
            Next →
          </button>
        </div>
      </AccordionSection>

      {/* ── Step 4 — Additional Points ── */}
      <AccordionSection
        stepNum={form.withSpouse ? 5 : 4}
        title="Additional Points (max 600 pts)"
        icon="🏆"
        isOpen={openSection === 4}
        isComplete={isAdditionalComplete(form)}
        onToggle={() => setOpenSection(openSection === 4 ? -1 : 4)}
      >
        <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          Select all that apply. Provincial Nomination alone awards 600 points.
        </p>

        <CheckboxItem
          id="sibling"
          label="Brother or sister living in Canada (+15 pts)"
          description="Who is a Canadian citizen or permanent resident aged 18 or older."
          checked={form.siblingInCanada}
          onChange={(v) => update("siblingInCanada", v)}
        />

        <SelectGroup
          label="French language ability bonus"
          name="frenchClb"
          options={FRENCH_CLB_OPTIONS}
          value={form.frenchClb}
          onChange={(v) => update("frenchClb", v)}
        />

        <SelectGroup
          label="Post-secondary education completed in Canada"
          name="postSecondaryCanada"
          options={POST_SECONDARY_CANADA_OPTIONS}
          value={form.postSecondaryCanada}
          onChange={(v) => update("postSecondaryCanada", v)}
        />

        <SelectGroup
          label="Arranged employment in Canada"
          name="arrangedEmployment"
          options={ARRANGED_EMPLOYMENT_OPTIONS}
          value={form.arrangedEmployment}
          onChange={(v) => update("arrangedEmployment", v)}
        />

        <CheckboxItem
          id="provNom"
          label="Provincial or Territorial Nomination (+600 pts)"
          description="A valid nomination certificate from a Canadian province or territory."
          checked={form.provincialNomination}
          onChange={(v) => update("provincialNomination", v)}
        />
      </AccordionSection>

      {/* Disclaimer */}
      <div
        className="rounded-xl p-4 mb-6 mt-2 text-xs leading-relaxed"
        style={{ backgroundColor: "var(--color-accent-bg)", color: "var(--color-text-muted)", borderLeft: "3px solid var(--color-accent)" }}
      >
        <strong style={{ color: "var(--color-text-main)" }}>Disclaimer:</strong>{" "}
        This tool uses the official IRCC CRS grid. Results are indicative only and may not reflect actual draw cut-offs, which vary by draw type and date.
        For personalised immigration advice, contact an MG Visa licensed advisor.
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        id="calculate-crs-button"
        aria-label="Calculate my Canada CRS Score"
        className="w-full py-4 px-8 rounded-2xl font-bold text-base tracking-wide transition-all duration-200 flex items-center justify-center gap-3"
        style={{
          backgroundColor: canSubmit ? "var(--color-primary)" : "var(--color-surface-3)",
          color: canSubmit ? "#FFFFFF" : "var(--color-text-light)",
          fontFamily: "var(--font-montserrat)",
          cursor: canSubmit ? "pointer" : "not-allowed",
          boxShadow: canSubmit ? "0 4px 20px rgba(40,56,64,0.3)" : "none",
        }}
      >
        {canSubmit ? (
          <>
            <span>🍁</span>
            Calculate My CRS Score
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-70">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Complete Step 1 (Profile) and Step 2 (Core Factors) to continue
          </>
        )}
      </button>
    </div>
    </>
  );
}
