"use client";

import { useEffect, useState } from "react";
import type { EgpRates } from "@/lib/exchange-rates";

// One snapshot drives both the visible EGP estimate and the bank-balance comparison.
export default function useEgpRates() {
  const [rates, setRates] = useState<EgpRates | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;
    let lastAttempt = 0;
    async function refresh() {
      if (inFlight || controller.signal.aborted || Date.now() - lastAttempt < 60000) return;
      inFlight = true;
      lastAttempt = Date.now();
      try {
        const response = await fetch("/api/exchange-rates", { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(12000)]) });
        if (!response.ok) throw new Error("Rate unavailable");
        const data: EgpRates = await response.json();
        const updated = Date.parse(data.updatedAt);
        if (!Number.isFinite(data.rates?.EUR) || data.rates.EUR <= 0 || !Number.isFinite(data.rates?.SEK) || data.rates.SEK <= 0 || !Number.isFinite(updated) || Date.now() - updated > 48 * 60 * 60 * 1000 || updated > Date.now() + 300000) throw new Error("Invalid rate");
        if (!controller.signal.aborted) { setRates(data); setError(false); }
      } catch {
        if (!controller.signal.aborted) { setRates(null); setError(true); }
      } finally { inFlight = false; }
    }
    function whenVisible() { if (document.visibilityState === "visible") void refresh(); }
    void refresh();
    const timer = window.setInterval(whenVisible, 15 * 60 * 1000);
    window.addEventListener("focus", whenVisible);
    document.addEventListener("visibilitychange", whenVisible);
    return () => {
      controller.abort(); window.clearInterval(timer);
      window.removeEventListener("focus", whenVisible);
      document.removeEventListener("visibilitychange", whenVisible);
    };
  }, [retry]);
  return { rates, error, refresh: () => { setError(false); setRetry(value => value + 1); } };
}
