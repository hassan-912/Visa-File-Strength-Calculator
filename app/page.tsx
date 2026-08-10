"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import ScoreForm from "@/components/ScoreForm";
import LoadingOverlay from "@/components/LoadingOverlay";
import ResultsDashboard from "@/components/ResultsDashboard";
import type { SelectionsMap, PenaltiesMap } from "@/lib/scoring";

type AppStep = "form" | "loading" | "results";

export default function HomePage() {
  const [step, setStep] = useState<AppStep>("form");
  // Multi-select: each category stores an array of selected option IDs
  const [selections, setSelections] = useState<SelectionsMap>({});
  const [activePenalties, setActivePenalties] = useState<PenaltiesMap>({});
  // Age is a separate number input, not a category
  const [age, setAge] = useState<number | null>(null);

  // Toggle an option ID within a category's selection array
  const handleSelectionToggle = useCallback(
    (categoryId: string, optionId: string, isSingleChoice: boolean = false) => {
      setSelections((prev) => {
        if (isSingleChoice) {
          return {
            ...prev,
            [categoryId]: [optionId],
          };
        }
        
        const current = prev[categoryId] ?? [];
        const isSelected = current.includes(optionId);
        return {
          ...prev,
          [categoryId]: isSelected
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      });
    },
    []
  );

  const handlePenaltyChange = useCallback(
    (penaltyId: string, active: boolean) => {
      setActivePenalties((prev) => ({ ...prev, [penaltyId]: active }));
    },
    []
  );

  const handleAgeChange = useCallback((value: number | null) => {
    setAge(value);
  }, []);

  const handleSubmit = useCallback(() => {
    setStep("loading");
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setStep("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleEdit = useCallback(() => {
    setStep("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      {step === "loading" && (
        <LoadingOverlay onComplete={handleLoadingComplete} durationMs={60000} />
      )}

      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
        <Header />

        {/* ── Hero Banner ── */}
        <section
          className="relative overflow-hidden border-b"
          style={{
            borderColor: "var(--color-border-light)",
            background: "linear-gradient(180deg, var(--color-accent-bg) 0%, var(--color-bg) 100%)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{
              background: "linear-gradient(90deg, transparent, var(--color-accent), transparent)",
            }}
          />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4"
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
              MG Visa Assessment Tool
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4"
              style={{
                color: "var(--color-primary)",
                fontFamily: "var(--font-montserrat)",
              }}
            >
              Visa File{" "}
              <span
                style={{
                  color: "var(--color-accent)",
                  borderBottom: "3px solid var(--color-accent)",
                  paddingBottom: "2px",
                }}
              >
                Strength
              </span>{" "}
              Calculator
            </h1>

            <p
              className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6"
              style={{ color: "var(--color-text-muted)" }}
            >
              Answer a few questions about your profile to receive an instant, AI-powered
              assessment of your visa application file strength — completely free.
            </p>


          </div>
        </section>

        {/* ── Main Content ── */}
        <main className="flex-1">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {step === "form" || step === "loading" ? (
              <ScoreForm
                selections={selections}
                activePenalties={activePenalties}
                age={age}
                onSelectionToggle={handleSelectionToggle}
                onPenaltyChange={handlePenaltyChange}
                onAgeChange={handleAgeChange}
                onSubmit={handleSubmit}
              />
            ) : (
              <ResultsDashboard
                selections={selections}
                activePenalties={activePenalties}
                age={age}
                onEdit={handleEdit}
              />
            )}
          </div>
        </main>

        {/* ── Footer ── */}
        <footer
          className="border-t py-12"
          style={{
            borderColor: "var(--color-primary-mid)",
            backgroundColor: "var(--color-primary)",
            color: "var(--color-text-on-dark)"
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
              {/* Logo & Basic Info */}
              <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left md:max-w-xs">
                <img src="/Logo W.png" alt="MG Visa Logo" className="h-12 w-auto object-contain" />
                <div>
                  <p className="text-sm font-semibold mb-1">
                    MG International Visa Consultancy
                  </p>
                  <p className="text-xs text-slate-300">
                    Your trusted partner for global visa and immigration services.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="flex-1 flex flex-col gap-4 text-sm text-slate-300 text-center md:text-left">
                <div>
                  <strong className="text-white">Cairo:</strong> Cairo – Nasr City – Makram Ebeid St – Delta Towers, Building 4, Section 2, 3rd Floor
                </div>
                <div>
                  <strong className="text-white">Dubai:</strong> M G I PORTAL: UAE – Dubai – Abuhail – Horalanz East – City Bay Business Center – Office 216 – Beside Canadian Hospital
                </div>
                <div>
                  <strong className="text-white">Zayed:</strong> TRIVIUM ZAYED Building, Trivium Zayed Complex, Services Land (2), 3rd Neighborhood – 2nd District, in front of Capital Business, 2nd Floor, Unit A231
                </div>
              </div>

              {/* Direct Contact */}
              <div className="flex flex-col gap-2 text-sm text-slate-300 text-center md:text-right">
                <div>
                  <strong className="text-white">Phone:</strong> 17621
                </div>
                <div>
                  <strong className="text-white">Email:</strong> Info@mg-visa.com
                </div>
                <div className="mt-2">
                  <a
                    href="https://mg-visa.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline underline-offset-2 transition-colors hover:text-white"
                  >
                    mg-visa.com
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-slate-600/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <p>
                © {new Date().getFullYear()} MG International Visa Consultancy. All rights reserved.
              </p>
              <p className="text-center sm:text-right max-w-md">
                This tool is for informational purposes only and does not constitute legal or immigration advice.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
