"use client";

import { convertToEgp, type EgpRates } from "@/lib/exchange-rates";

const amountFormat = new Intl.NumberFormat("en-GB", { style: "currency", currency: "EGP", maximumFractionDigits: 0 });
const rateFormat = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 4 });
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Cairo" });

export default function EgpEquivalent({ amount, currency, rates, error, onRetry }: { amount: number; currency: "EUR" | "SEK"; rates: EgpRates | null; error: boolean; onRetry: () => void }) {
  return <div className="js-egp">
    <p className="text-xs font-semibold uppercase tracking-wider">Equivalent in Egyptian pounds</p>
    <div role="status" aria-live="polite">
      {rates ? <>
        <p className="js-egp-amount">≈ {amountFormat.format(convertToEgp(amount, currency, rates))}</p>
        <p className="mt-2 text-xs leading-5">1 {currency} = {rateFormat.format(rates.rates[currency])} EGP</p>
        <p className="mt-2 text-[10px] leading-5">Rate updated <time dateTime={rates.updatedAt}>{dateFormat.format(new Date(rates.updatedAt))}</time> (Cairo)</p>
      </> : <p className="mt-3 text-xs leading-6">{error ? "EGP estimate temporarily unavailable." : "Loading the latest EGP rate…"}</p>}
    </div>
    {error && <button type="button" className="mt-2 text-xs underline underline-offset-4" onClick={onRetry}>Retry exchange rate</button>}
  </div>;
}
