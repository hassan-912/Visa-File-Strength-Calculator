"use client";

import { useEffect, useState } from "react";
import { convertToEgp, type EgpRates } from "@/lib/exchange-rates";

const amountFormat = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EGP", maximumFractionDigits: 0 });
const rateFormat = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 4 });
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Cairo" });

export default function EgpEquivalent({ amount, currency }: { amount: number; currency: "EUR" | "SEK" }) {
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
        if (!Number.isFinite(data.rates?.EUR) || data.rates.EUR <= 0 || !Number.isFinite(data.rates?.SEK) || data.rates.SEK <= 0 || !Number.isFinite(Date.parse(data.updatedAt))) throw new Error("Invalid rate");
        if (!controller.signal.aborted) { setRates(data); setError(false); }
      } catch {
        if (!controller.signal.aborted) { setRates(null); setError(true); }
      } finally { inFlight = false; }
    }
    function refreshWhenVisible() { if (document.visibilityState === "visible") void refresh(); }
    void refresh();
    const timer = window.setInterval(refreshWhenVisible, 15 * 60 * 1000);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [retry]);

  return <div className="js-egp">
    <p className="text-xs font-semibold uppercase tracking-wider">Equivalent in Egyptian pounds</p>
    <div role="status" aria-live="polite">
      {rates ? <>
        <p className="js-egp-amount">≈ {amountFormat.format(convertToEgp(amount, currency, rates))}</p>
        <p className="mt-2 text-xs leading-5">1 {currency} = {rateFormat.format(rates.rates[currency])} EGP</p>
        <p className="mt-2 text-[10px] leading-5">Rate updated <time dateTime={rates.updatedAt}>{dateFormat.format(new Date(rates.updatedAt))}</time> (Cairo)</p>
      </> : <p className="mt-3 text-xs leading-6">{error ? "EGP estimate temporarily unavailable." : "Loading the latest EGP rate…"}</p>}
    </div>
    {error && <button type="button" className="mt-2 text-xs underline underline-offset-4" onClick={() => { setError(false); setRetry(value => value + 1); }}>Retry exchange rate</button>}
    <p className="mt-3 text-[10px] leading-5">Daily indicative rates, checked automatically. Your bank’s rate and fees may differ. The requirement remains in {currency}.</p>
    <a className="mt-2 inline-block text-[10px] underline underline-offset-4" href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">Rates by ExchangeRate-API ↗</a>
  </div>;
}
