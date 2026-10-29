"use client";

import { CATEGORIES, PENALTIES } from "@/lib/scoring";
import type { SelectionsMap, PenaltiesMap } from "@/lib/scoring";

interface ScoreFormProps {
  selections: SelectionsMap;
  activePenalties: PenaltiesMap;
  onSelectionToggle: (categoryId: string, optionId: string, isSingleChoice?: boolean) => void;
  onPenaltyChange: (penaltyId: string, active: boolean) => void;
  onSubmit: () => void;
}

export default function ScoreForm({
  selections,
  activePenalties,
  onSelectionToggle,
  onPenaltyChange,
  onSubmit,
}: ScoreFormProps) {
  const answeredCategories = CATEGORIES.filter(
    (cat) => (selections[cat.id]?.length ?? 0) > 0
  ).length;
  const totalSections = CATEGORIES.length;
  const answeredCount = answeredCategories;
  const isComplete = answeredCount === totalSections;
  const nextSection = CATEGORIES.find((category) => !selections[category.id]?.length);

  return (
    <div className="profile-layout">
      {/* Section Header */}
      <aside className="profile-sidebar" aria-label="Profile completion">
        <h2
          id="profile-title" tabIndex={-1}
          className="text-2xl font-bold leading-tight mb-3"
          style={{ color: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
        >
          Tourism Visa Profile
        </h2>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Select the most accurate option in each section. Your responses are strictly confidential.
        </p>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
              {answeredCount} of {totalSections} sections completed
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: isComplete ? "var(--color-strong)" : "var(--color-accent)" }}
            >
              {Math.round((answeredCount / totalSections) * 100)}%
            </span>
          </div>
          <div role="progressbar" aria-label="Profile sections completed" aria-valuemin={0} aria-valuemax={totalSections} aria-valuenow={answeredCount} className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-surface-3)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${(answeredCount / totalSections) * 100}%`,
                backgroundColor: isComplete ? "var(--color-strong)" : "var(--color-accent)",
              }}
            />
          </div>
        </div>
        <p className="profile-nav-heading">Jump to a section</p>
        <nav className="profile-section-nav" aria-label="Jump to a profile section">
          {CATEGORIES.map((category, index) => (
            <a key={category.id} href={`#profile-${category.id}`} data-complete={!!selections[category.id]?.length}>
              <span className="profile-nav-marker" aria-hidden="true">{selections[category.id]?.length ? <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="m7.5 13.2-3.4-3.4-1.2 1.3 4.6 4.6 9.6-9.6-1.3-1.3z" /></svg> : index + 1}</span>
              <span>{category.title}</span>
              <span className="sr-only">{selections[category.id]?.length ? ": answered" : ": not answered"}</span>
            </a>
          ))}
        </nav>
        <p className="profile-next" aria-live="polite">
          {nextSection ? <a href={`#profile-${nextSection.id}`}>Next unanswered: {nextSection.title} <span aria-hidden="true">→</span></a> : <a href="#profile-submit">All sections answered. Review risk factors and analyse your file.</a>}
        </p>
      </aside>

      <div className="profile-fields">

      {/* Application Parameters Divider */}
      {/* Base Score Categories */}
      <div className="space-y-4 mb-8">
        {CATEGORIES.map((category, catIdx) => {
          const selectedIds = selections[category.id] ?? [];
          const isAnswered = selectedIds.length > 0;

          return (
            <div
              key={category.id}
              id={`profile-${category.id}`}
              tabIndex={-1}
              role="group" aria-labelledby={`heading-${category.id}`}
              className="profile-section rounded-2xl border"
              style={{
                borderColor: isAnswered ? "var(--color-accent)" : "var(--color-border-light)",
                backgroundColor: "var(--color-surface)",
              }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-3">
                  <span className="profile-section-number" aria-hidden="true">{catIdx + 1}</span>
                  <div>
                    <h3
                      id={`heading-${category.id}`} tabIndex={-1}
                      className="font-bold text-base leading-tight"
                      style={{ color: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
                    >
                      {category.title}
                    </h3>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
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

              {/* Options */}
              <div className="px-5 pb-5 space-y-2">
                {category.options.map((option) => {
                  const isChecked = selectedIds.includes(option.id);
                  const isRadio = category.inputType === "radio";
                  return (
                    <label
                      key={option.id}
                      htmlFor={option.id}
                      className="profile-option flex items-start gap-3 px-4 py-3 rounded-xl border cursor-pointer"
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
                        <div
                          className={`w-4 h-4 border-2 flex items-center justify-center transition-all duration-150 ${isRadio ? "rounded-full" : "rounded"}`}
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
                          {isChecked && isRadio && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <span
                        className="text-sm leading-relaxed"
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

      {/* Risk Factors Divider */}
      <div className="mb-3">
        <h3 className="text-lg font-bold" style={{ color: "var(--color-text-main)" }}>
          Risk Factors
        </h3>
      </div>

      <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
        Check all risk factors that apply. These are assessed by embassies and may significantly impact your outcome.
      </p>

      {/* Penalties */}
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
              className="profile-option flex items-start gap-4 px-5 py-4 cursor-pointer"
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

      {/* Disclaimer */}
      <div
        className="rounded-xl p-4 mb-6 text-sm leading-relaxed"
        style={{
          backgroundColor: "var(--color-accent-bg)",
          color: "var(--color-text-muted)",
        }}
      >
        <strong style={{ color: "var(--color-text-main)" }}>Disclaimer:</strong>{" "}
        This calculator provides an indicative assessment only. Visa decisions are ultimately
        made by the relevant embassy or consulate based on their own evaluation criteria, which
        may include undisclosed factors. This tool does not constitute legal or immigration
        advice. For personalised consultation, please contact an MG Visa licensed advisor.
      </div>

      {/* Submit Button */}
      <div id="profile-submit" className="profile-section">
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
            {`Complete all ${totalSections - answeredCount} remaining section${totalSections - answeredCount !== 1 ? "s" : ""} to continue`}
          </>
        )}
      </button>
      </div>
      </div>
    </div>
  );
}
