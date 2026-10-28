import { parseEgpRates } from "@/lib/exchange-rates";

export async function GET() {
  try {
    // Public reference rates; no account, API key, or visitor data is required.
    const response = await fetch("https://open.er-api.com/v6/latest/EUR", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Rate provider unavailable");
    const rates = parseEgpRates(await response.json());
    return Response.json(rates, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
  } catch {
    return Response.json({ error: "The EGP exchange rate is temporarily unavailable. Please try again shortly." }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
