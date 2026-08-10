"use client";

import { CATEGORIES, PENALTIES, AGE_MAX_SCORE } from "@/lib/scoring";
import type { SelectionsMap, PenaltiesMap } from "@/lib/scoring";

interface ScoreFormProps {
  selections: SelectionsMap;
  activePenalties: PenaltiesMap;
  age: number | null;
  onSelectionToggle: (categoryId: string, optionId: string, isSingleChoice?: boolean) => void;
  onPenaltyChange: (penaltyId: string, active: boolean) => void;
  onAgeChange: (value: number | null) => void;
  onSubmit: () => void;
}

export default function ScoreForm({
  selections,
  activePenalties,
  age,
  onSelectionToggle,
  onPenaltyChange,
  onAgeChange,
  onSubmit,
}: ScoreFormProps) {
  // A section is "answered" if at least one checkbox is checked
  const answeredCategories = CATEGORIES.filter(
    (cat) => (selections[cat.id]?.length ?? 0) > 0
  ).length;
  const ageAnswered = age !== null && age >= 1;
  // Total sections = categories + age field
  const totalSections = CATEGORIES.length + 1;
  const answeredCount = answeredCategories + (ageAnswered ? 1 : 0);
  const isComplete = answeredCount === totalSections;

  function handleAgeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") {
      onAgeChange(null);
    } else {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        onAgeChange(parsed);
      }
    }
  }

  return (
    <div className="animate-fadeInUp">
      {/* ── Section Header ── */}
      <div className="mb-8">
        <div
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3"
          style={{
            backgroundColor: "var(--color-accent-bg)",
            color: "var(--color-accent)",
            border: "1px solid var(--color-accent-border)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "var(--color-accent-hover)" }}
          />
          Complete Your Profile
        </div>

        <h2
          className="text-2xl sm:text-3xl font-bold leading-tight mb-2"
          style={{ color: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
        >
          Visa Application Profile
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Select all that apply in each section for the most accurate assessment.
          Your responses are strictly confidential.
        </p>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>
              {answeredCount} of {totalSections} sections completed
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: isComplete ? "var(--color-strong)" : "var(--color-accent)" }}
            >
              {Math.round((answeredCount / totalSections) * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface-3)" }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(answeredCount / totalSections) * 100}%`,
                backgroundColor: isComplete ? "var(--color-strong)" : "var(--color-accent)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Application Parameters Divider ── */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="h-px flex-1"
          style={{ background: "linear-gradient(to right, var(--color-accent), transparent)" }}
        />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-accent)" }}>
          Application Parameters
        </span>
        <div
          className="h-px flex-1"
          style={{ background: "linear-gradient(to left, var(--color-accent), transparent)" }}
        />
      </div>

      {/* ── Base Score Categories (Checkboxes) ── */}
      <div className="space-y-4 mb-8">
        {CATEGORIES.map((category, catIdx) => {
          const selectedIds = selections[category.id] ?? [];
          const isAnswered = selectedIds.length > 0;

          return (
            <div
              key={category.id}
              className="rounded-2xl border transition-all duration-200"
              style={{
                borderColor: isAnswered ? "var(--color-accent)" : "var(--color-border-light)",
                backgroundColor: "var(--color-surface)",
                boxShadow: isAnswered
                  ? "0 0 0 3px rgba(30,58,138,0.08)"
                  : "0 1px 3px rgba(0,0,0,0.05)",
                animationDelay: `${catIdx * 50}ms`,
              }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-xl text-lg shrink-0"
                    style={{
                      backgroundColor: isAnswered ? "var(--color-accent-bg)" : "var(--color-surface-2)",
                    }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3
                      className="font-bold text-sm leading-tight"
                      style={{ color: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
                    >
                      {category.title}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {category.description}
                    </p>
                  </div>
                </div>

                {isAnswered && (
                  <div
                    className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full"
                    style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Checkbox / Radio options — key uses option.id, NOT option.value */}
              <div className="px-5 pb-5 space-y-2">
                {category.options.map((option) => {
                  const isChecked = selectedIds.includes(option.id);
                  const isRadio = (category as any).inputType === "radio";
                  return (
                    <label
                      key={option.id}
                      htmlFor={option.id}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-150"
                      style={{
                        backgroundColor: isChecked ? "var(--color-accent-bg)" : "var(--color-surface-2)",
                        borderColor: isChecked ? "var(--color-accent)" : "var(--color-border-light)",
                      }}
                    >
                      <div className="mt-0.5 shrink-0">
                        <input
                          type={isRadio ? "radio" : "checkbox"}
                          name={category.id}
                          id={option.id}
                          checked={isChecked}
                          onChange={() => onSelectionToggle(category.id, option.id, isRadio)}
                          className="sr-only"
                        />
                        {/* Custom checkbox/radio indicator */}
                        <div
                          className={`w-4 h-4 border-2 flex items-center justify-center transition-all duration-150 ${isRadio ? 'rounded-full' : 'rounded'}`}
                          style={{
                            borderColor: isChecked ? "var(--color-accent)" : "var(--color-border)",
                            backgroundColor: isChecked ? "var(--color-accent)" : "transparent",
                          }}
                        >
                          {isChecked && !isRadio && (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white" className="w-3 h-3">
                              <path fillRule="evenodd" d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {isChecked && isRadio && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <span
                        className="text-sm leading-snug"
                        style={{
                          color: isChecked ? "var(--color-accent)" : "var(--color-text-body)",
                          fontWeight: isChecked ? "600" : "400",
                        }}
                      >
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Age Number Input ── */}
      <div
        className="rounded-2xl border mb-8 transition-all duration-200"
        style={{
          borderColor: ageAnswered ? "var(--color-accent)" : "var(--color-border-light)",
          backgroundColor: "var(--color-surface)",
          boxShadow: ageAnswered
            ? "0 0 0 3px rgba(30,58,138,0.08)"
            : "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl text-lg shrink-0"
              style={{
                backgroundColor: ageAnswered ? "var(--color-accent-bg)" : "var(--color-surface-2)",
              }}
            >
              🧑
            </div>
            <div>
              <h3
                className="font-bold text-sm leading-tight"
                style={{ color: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
              >
                Age
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                Enter your current age in years
              </p>
            </div>
          </div>

          {ageAnswered && (
            <div
              className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full"
              style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        <div className="px-5 pb-5">
          <input
            type="number"
            id="age-input"
            min={1}
            max={120}
            value={age ?? ""}
            onChange={handleAgeInput}
            placeholder="Enter your age (e.g. 34)"
            className="w-full px-4 py-3 rounded-xl border text-sm transition-all duration-150 outline-none"
            style={{
              borderColor: ageAnswered ? "var(--color-accent)" : "var(--color-border)",
              backgroundColor: ageAnswered ? "var(--color-accent-bg)" : "var(--color-surface-2)",
              color: "var(--color-text-main)",
              fontFamily: "var(--font-montserrat)",
            }}
            aria-label="Your current age"
          />
          {age !== null && age < 18 && (
            <p className="text-xs mt-2" style={{ color: "var(--color-text-muted)" }}>
              Applicants under 18 do not receive age bracket points, but may still apply with a guardian.
            </p>
          )}
        </div>
      </div>

      {/* ── Risk Factors Divider ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1" style={{ background: "linear-gradient(to right, #DC2626, transparent)" }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#DC2626" }}>
          Risk Factors
        </span>
        <div className="h-px flex-1" style={{ background: "linear-gradient(to left, #DC2626, transparent)" }} />
      </div>

      <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
        Check all risk factors that apply. These are assessed by embassies and may significantly impact your outcome.
      </p>

      {/* ── Penalties ── */}
      <div
        className="rounded-2xl border overflow-hidden mb-8"
        style={{
          borderColor: "var(--color-border-light)",
          backgroundColor: "var(--color-surface)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        {PENALTIES.map((penalty, idx) => {
          const isActive = !!activePenalties[penalty.id];
          return (
            <label
              key={penalty.id}
              htmlFor={`penalty-${penalty.id}`}
              className="flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors duration-150"
              style={{
                backgroundColor: isActive ? "rgba(220,38,38,0.04)" : idx % 2 === 0 ? "var(--color-surface)" : "var(--color-surface-2)",
                borderBottom: idx < PENALTIES.length - 1 ? "1px solid var(--color-border-light)" : "none",
              }}
            >
              <div className="mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  id={`penalty-${penalty.id}`}
                  checked={isActive}
                  onChange={(e) => onPenaltyChange(penalty.id, e.target.checked)}
                  className="sr-only"
                />
                <div
                  className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150"
                  style={{
                    borderColor: isActive ? "#DC2626" : "var(--color-border)",
                    backgroundColor: isActive ? "#DC2626" : "transparent",
                  }}
                >
                  {isActive && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold mb-0.5 leading-snug"
                  style={{
                    color: isActive ? "#DC2626" : "var(--color-text-main)",
                    fontFamily: "var(--font-montserrat)",
                  }}
                >
                  {penalty.label}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                  {penalty.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* ── Disclaimer ── */}
      <div
        className="rounded-xl p-4 mb-8 text-xs leading-relaxed"
        style={{
          backgroundColor: "var(--color-accent-bg)",
          color: "var(--color-text-muted)",
          borderLeft: "3px solid var(--color-accent)",
        }}
      >
        <strong style={{ color: "var(--color-text-main)" }}>Disclaimer:</strong>{" "}
        This calculator provides an indicative assessment only. Visa decisions are ultimately
        made by the relevant embassy or consulate based on their own evaluation criteria, which
        may include undisclosed factors. This tool does not constitute legal or immigration
        advice. For personalised consultation, please contact an MG Visa licensed advisor.
      </div>

      {/* ── Submit Button ── */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={!isComplete}
        id="analyse-button"
        aria-label="Analyse my visa file"
        className="w-full py-4 px-8 rounded-2xl font-bold text-base tracking-wide transition-all duration-200 flex items-center justify-center gap-3"
        style={{
          backgroundColor: isComplete ? "var(--color-primary)" : "var(--color-surface-3)",
          color: isComplete ? "#FFFFFF" : "var(--color-text-light)",
          fontFamily: "var(--font-montserrat)",
          cursor: isComplete ? "pointer" : "not-allowed",
          boxShadow: isComplete ? "0 4px 20px rgba(10,25,47,0.3)" : "none",
        }}
      >
        {isComplete ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12 2a10 10 0 100 20A10 10 0 0012 2zm3.707 8.707a1 1 0 00-1.414-1.414L11 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Analyse Visa File
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 opacity-70">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Complete all {totalSections - answeredCount} remaining section
            {totalSections - answeredCount !== 1 ? "s" : ""} to continue
          </>
        )}
      </button>
    </div>
  );
}
