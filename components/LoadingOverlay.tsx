"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  { icon: "🛫", text: "Profile Submitted: Initializing MG Visa AI Assessment..." },
  { icon: "🌍", text: "Verifying international travel history & passport records..." },
  { icon: "💳", text: "Auditing financial health, liquidity & transaction stability..." },
  { icon: "🏢", text: "Cross-checking employment status & tie strength..." },
  { icon: "🛬", text: "Finalizing: Generating MG Visa File Strength Index..." },
];

interface LoadingOverlayProps {
  onComplete: () => void;
  durationMs?: number; // Should be 15000
}

export default function LoadingOverlay({
  onComplete,
  durationMs = 15000,
}: LoadingOverlayProps) {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);
  const [fadeMsg, setFadeMsg] = useState(true);

  // Cycle through messages every 3 seconds (3000ms) - using a ref or closure variable to avoid state batching freezes
  useEffect(() => {
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < MESSAGES.length - 1) {
        setFadeMsg(false);
        setTimeout(() => {
          currentIdx++;
          setMsgIndex(currentIdx);
          setFadeMsg(true);
        }, 300);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Smooth Progress & Timer
  useEffect(() => {
    // Update every 50ms
    const intervalMs = 50;
    const totalSteps = durationMs / intervalMs;
    const stepAmount = 100 / totalSteps;

    const tick = setInterval(() => {
      setProgress((p) => {
        const next = p + stepAmount;
        return next >= 100 ? 100 : next;
      });
    }, intervalMs);

    const timer = setTimeout(() => {
      setProgress(100);
      setTimeout(onComplete, 400); // Small delay at 100% before transitioning
    }, durationMs);

    return () => {
      clearInterval(tick);
      clearTimeout(timer);
    };
  }, [durationMs, onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-mid) 100%)",
      }}
    >
      {/* ── Background Radar / Passport Stamp Effect ── */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Radar circles */}
        <div
          className="absolute rounded-full border border-[rgba(255,255,255,0.03)]"
          style={{ width: "80vw", height: "80vw", maxWidth: "800px", maxHeight: "800px" }}
        />
        <div
          className="absolute rounded-full border border-[rgba(255,255,255,0.05)]"
          style={{ width: "60vw", height: "60vw", maxWidth: "600px", maxHeight: "600px" }}
        />
        <div
          className="absolute rounded-full border border-[rgba(255,255,255,0.08)]"
          style={{ width: "40vw", height: "40vw", maxWidth: "400px", maxHeight: "400px" }}
        />
        
        {/* Pulsing deep navy radar sweep */}
        <div
          className="absolute rounded-full opacity-30"
          style={{
            width: "50vw",
            height: "50vw",
            maxWidth: "500px",
            maxHeight: "500px",
            background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
            animation: "pulse-ring 4s ease-in-out infinite",
          }}
        />
      </div>

      {/* ── Main Content Container ── */}
      <div className="relative text-center max-w-2xl w-full">
        {/* Title */}
        <h2
          className="text-2xl font-bold mb-2 text-white"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          MG Visa AI Analysis
        </h2>
        <p className="text-sm mb-12" style={{ color: "rgba(255,255,255,0.5)" }}>
          Please wait while we process your application profile
        </p>

        {/* ── Animated Flight Path ── */}
        <div className="relative w-full max-w-lg mx-auto mb-16">
          {/* EXTRA LARGE Real Flight Progress Bar with Realistic Smoke Trail */}
          <div className="relative h-24 flex items-center w-full my-10">
            {/* Background Track Line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 bg-slate-200 rounded-full" />

            {/* Active Completed Flight Line */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded-full transition-all duration-100 ease-linear shadow-[0_0_12px_rgba(40,56,64,0.4)]"
              style={{ 
                backgroundColor: 'var(--color-primary, #283840)', 
                width: `${progress}%` 
              }} 
            />

            {/* Plane & Smoke Trail Wrapper */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 -ml-8 flex items-center justify-center transition-all duration-100 ease-linear pointer-events-none"
              style={{ left: `${progress}%`, zIndex: 10 }}
            >
              {/* REALISTIC Smoke Trail (Larger, layered, fading expanding clouds) */}
              <div className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-16 pointer-events-none flex items-center justify-end overflow-visible">
                {/* Main engine exhaust stream */}
                <div className="w-full h-3 bg-gradient-to-l from-slate-400/90 via-slate-300/40 to-transparent rounded-full blur-[2px]" />
                
                {/* Expanding smoke clouds (layered for realism) */}
                <div className="absolute right-2 w-4 h-4 bg-slate-300/80 rounded-full blur-[2px] animate-ping opacity-60" />
                <div className="absolute right-6 w-6 h-6 bg-slate-300/60 rounded-full blur-[3px] -translate-y-2 animate-pulse" />
                <div className="absolute right-12 w-8 h-8 bg-slate-200/50 rounded-full blur-[4px] translate-y-2" />
                <div className="absolute right-20 w-12 h-12 bg-slate-200/30 rounded-full blur-[5px] -translate-y-1" />
                <div className="absolute right-32 w-16 h-16 bg-slate-200/10 rounded-full blur-[6px] translate-y-1" />
              </div>

              {/* BIGGER Commercial Airplane Badge -> Now ONLY MG Visa Logo (Rotated horizontally) */}
              <div className="flex items-center justify-center">
                <img src="/Logo W.png" alt="MG Visa" className="w-12 h-12 object-contain transform rotate-90" />
              </div>
            </div>
          </div>
          
          {/* Labels under the path */}
          <div className="absolute top-full left-0 right-0 mt-2 flex justify-between text-[10px] font-bold uppercase tracking-widest text-[rgba(255,255,255,0.4)]">
            <span>Profile Submitted</span>
            <span>File Verified</span>
          </div>
        </div>

        {/* ── Status Message ── */}
        <div
          className="min-h-[64px] flex flex-col items-center justify-center mb-10 px-6 py-4 rounded-xl border"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="flex flex-col sm:flex-row items-center gap-3 transition-all duration-300"
            style={{
              opacity: fadeMsg ? 1 : 0,
              transform: fadeMsg ? "translateY(0)" : "translateY(8px)",
            }}
          >
            <span className="text-2xl shrink-0">{MESSAGES[msgIndex].icon}</span>
            <p
              className="text-sm font-medium leading-relaxed text-white shadow-sm"
            >
              {MESSAGES[msgIndex].text}
            </p>
          </div>
        </div>

        {/* ── Global Progress Bar ── */}
        <div className="w-full max-w-sm mx-auto">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] uppercase tracking-widest text-[rgba(255,255,255,0.4)]">
              Analysis Progress
            </span>
            <span className="text-sm font-bold text-white font-mono">
              {Math.round(progress)}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${progress}%`,
                backgroundColor: "var(--color-primary)",
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
