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
    <div className="animate-fadeInUp max-w-3xl mx-auto">
      {/* ── Hero Result Card ── */}
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

      {/* ── Score Breakdown ── */}
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

      {/* ── Active Penalties ── */}
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



      {/* ── Edit Button ── */}
      <button
        type="button"
        onClick={onEdit}
        id="edit-profile-button"
        aria-label="Edit application profile and re-analyse"
        className="w-full py-4 px-8 rounded-2xl font-semibold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-3 border-2"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-primary)",
          color: "var(--color-primary)",
          fontFamily: "var(--font-montserrat)",
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
          <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
        </svg>
        Edit Application Profile &amp; Re-Analyse
      </button>
    </div>
  );
}
