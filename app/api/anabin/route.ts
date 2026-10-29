import { anabinId, anabinSearchUrl, mapAnabinMatches, normalizeAnabinQuery, validAnabinId, type AnabinKind } from "@/lib/anabin";

async function readAnabin(url: string, signal: AbortSignal) {
  const response = await fetch(url, { next: { revalidate: 3600 }, signal });
  if (!response.ok) throw new Error("Anabin unavailable");
  return response.json();
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const kind = params.get("kind");
  const raw = params.get("q") ?? "";
  const institutionId = params.get("institution") ?? "";
  if (!["institution", "degree"].includes(kind ?? "") || raw.length > 100 || /[^\p{L}\p{N}\s.,'’&()/-]/u.test(raw) || (institutionId && !validAnabinId(institutionId))) {
    return Response.json({ error: "Enter a valid university or degree name." }, { status: 400 });
  }
  const query = normalizeAnabinQuery(raw);
  if (query.length < 2) return Response.json({ matches: [], query, source: "Anabin" });
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(12000)]);
  try {
    const type = kind as AnabinKind;
    let countryId = "";
    if (type === "degree" && institutionId) {
      const institution = await readAnabin(`https://anabin.kmk.org/api/public/institution/${institutionId}?reference=true`, signal);
      if (anabinId(institution) !== institutionId || institution.hidden === true || institution.deleted === true) throw new Error("Institution unavailable");
      countryId = anabinId(institution.country);
      if (!countryId) throw new Error("Country unavailable");
    }
    const countryFilter = countryId ? { country: { $oid: countryId } } : {};
    const queries = type === "degree" && institutionId
      ? [{ ...countryFilter, institutions: { $oid: institutionId } }, countryFilter]
      : [countryFilter];
    const batches = await Promise.all(queries.map(filter => readAnabin(anabinSearchUrl(type, query, filter), signal)));
    const combined = batches.flatMap(batch => { if (!Array.isArray(batch)) throw new Error("Invalid records"); return batch; });
    const matches = mapAnabinMatches(type, combined, query, institutionId, countryId);
    return Response.json({ matches, query, source: "Anabin", checkedAt: new Date().toISOString() }, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch {
    return Response.json({ error: "Anabin search is temporarily unavailable. Please retry; an unavailable search is not a negative recognition result." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
