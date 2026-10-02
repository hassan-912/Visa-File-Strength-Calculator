"use client";

import { useState } from "react";
import Header from "@/components/Header";
import CanadaCRSForm from "@/components/CanadaCRSForm";
import AustraliaPlaceholder from "@/components/AustraliaPlaceholder";

type ImmigrationSubTab = "canada" | "australia";

export default function ImmigrationPage() {
  const [subTab, setSubTab] = useState<ImmigrationSubTab>("canada");

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <Header />

      {/* Hero Banner */}
      <section
        className="relative overflow-hidden border-b"
        style={{
          borderColor: "var(--color-border-light)",
          background: "linear-gradient(180deg, var(--color-accent-bg) 0%, var(--color-bg) 100%)",
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: "linear-gradient(90deg, transparent, var(--color-accent), transparent)" }}
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
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent-hover)" }} />
            MG Immigration Assessment
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4"
            style={{ color: "var(--color-primary)", fontFamily: "var(--font-montserrat)" }}
          >
            Immigration{" "}
            <span style={{ color: "var(--color-accent)", borderBottom: "3px solid var(--color-accent)", paddingBottom: "2px" }}>
              CRS
            </span>{" "}
            Calculator
          </h1>

          <p className="text-sm sm:text-base max-w-xl mx-auto mb-8" style={{ color: "var(--color-text-muted)" }}>
            Canada Express Entry Comprehensive Ranking System, powered by the official IRCC scoring grid.
          </p>

          {/* Canada / Australia sub-tab toggle */}
          <div className="flex items-center justify-center">
            <div
              className="inline-flex rounded-2xl p-1 gap-1"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border-light)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              {(["canada", "australia"] as const).map((tab) => {
                const isActive = subTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    id={`immigration-subtab-${tab}`}
                    onClick={() => setSubTab(tab)}
                    className="relative px-7 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? "#283840" : "transparent",
                      color: isActive ? "#FFFFFF" : "#283840",
                      border: isActive ? "1.5px solid #283840" : "1.5px solid transparent",
                      fontFamily: "var(--font-montserrat)",
                      boxShadow: isActive ? "0 4px 16px rgba(40,56,64,0.25)" : "none",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {tab === "canada" ? "Canada" : "Australia"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {subTab === "canada" ? (
            <CanadaCRSForm />
          ) : (
            <AustraliaPlaceholder />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer
        className="border-t py-12"
        style={{
          borderColor: "var(--color-primary-mid)",
          backgroundColor: "var(--color-primary)",
          color: "var(--color-text-on-dark)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left md:max-w-xs">
              <img src="/Logo W.png" alt="MG Visa Logo" className="h-12 w-auto object-contain" />
              <div>
                <p className="text-sm font-semibold mb-1">MG International Visa Consultancy</p>
                <p className="text-xs text-slate-300">Your trusted partner for global visa and immigration services.</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-4 text-sm text-slate-300 text-center md:text-left">
              <div><strong className="text-white">Cairo:</strong> Cairo, Nasr City, Makram Ebeid St, Delta Towers, Building 4, Section 2, 3rd Floor</div>
              <div><strong className="text-white">Dubai:</strong> UAE, Dubai, Abuhail, Horalanz East, City Bay Business Center, Office 216</div>
              <div><strong className="text-white">Zayed:</strong> TRIVIUM ZAYED Building, Trivium Zayed Complex, Services Land (2), 3rd Neighborhood, 2nd District, Unit A231</div>
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate-300 text-center md:text-right">
              <div><strong className="text-white">Phone:</strong> 17621</div>
              <div><strong className="text-white">Email:</strong> Info@mg-visa.com</div>
              <div className="mt-2">
                <a href="https://mg-visa.com" target="_blank" rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-2 transition-colors hover:text-white">
                  mg-visa.com
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-slate-600/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>{`\u00a9 ${new Date().getFullYear()} MG International Visa Consultancy. All rights reserved.`}</p>
            <p className="text-center sm:text-right max-w-md">
              This tool is for informational purposes only and does not constitute legal or immigration advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
