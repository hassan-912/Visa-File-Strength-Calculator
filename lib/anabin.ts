export type AnabinKind = "institution" | "degree";
export interface AnabinMatch {
  id: string;
  kind: AnabinKind;
  label: string;
  subtitle: string;
  countryId: string;
  country: string;
  status: "hplus" | "conditional" | "negative" | "equivalent" | "partial" | "unknown";
  statusLabel: string;
  association: "institution" | "country" | "global";
  sourceUrl: string;
}

type Data = Record<string, unknown>;
const object = (value: unknown): Data => value && typeof value === "object" && !Array.isArray(value) ? value as Data : {};
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
export const validAnabinId = (value: unknown): value is string => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
export const anabinId = (value: unknown): string => {
  const id = typeof value === "string" ? value : object(value)._id ?? object(value).id;
  return validAnabinId(id) ? id : "";
};
export function anabinText(value: unknown): string {
  return typeof value === "string" ? value.replace(/<[^>]*>/g, " ").replace(/&(?:nbsp|amp|quot|lt|gt);/gi, " ").replace(/\s+/g, " ").trim().slice(0, 400) : "";
}
export function normalizeAnabinQuery(value: string): string {
  return value.trim().replace(/\s+/g, " ").replace(/\bscince\b/gi, "science").replace(/\bcomputer\s*science\b/gi, "computer science").toLowerCase();
}
export function anabinSearchUrl(kind: AnabinKind, query: string, filter: Data = {}): string {
  const params = new URLSearchParams({ search: normalizeAnabinQuery(query), filter: JSON.stringify(filter), limit: "16", offset: "0", reference: "true" });
  return `https://anabin.kmk.org/api/public/${kind}?${params}`;
}
function visible(value: unknown) {
  const row = object(value);
  return row.hidden !== true && row.deleted !== true && row.publicated !== false;
}
function label(row: Data) {
  const short = anabinText(row.nameShort);
  const latinPart = short.split(" / ").reverse().find(part => /[a-z]/i.test(part) && !/[\u0600-\u06ff]/.test(part));
  return latinPart || anabinText(row.nameGerman) || short;
}
function countryLabel(row: Data) {
  const name = anabinText(object(row.country).nameShort);
  return name === "Ägypten" ? "Egypt" : name;
}
function relevance(row: Data, query: string): number {
  const field = object(row.fieldOfStudy);
  const aliases = [...array(row.alternativeNames), ...array(field.alternativeNames)].map(value => anabinText(object(value).nameShort));
  const text = [label(row), anabinText(row.nameShort), anabinText(row.nameGerman), anabinText(field.nameShort), anabinText(field.nameGerman), ...aliases].join(" ").normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
  const q = normalizeAnabinQuery(query).normalize("NFKD").replace(/\p{M}/gu, "");
  const words = q.split(/\s+/).filter(word => !["of", "in", "and", "the"].includes(word));
  if (!words.length || !words.every(word => text.includes(word))) return 0;
  return (text.includes(q) ? 10 : 1) + (label(row).toLowerCase().startsWith(q) ? 10 : 0);
}
export function degreeEquivalence(value: unknown): Pick<AnabinMatch, "status" | "statusLabel"> {
  const equivalences = array(object(value).equivalences).filter(visible).map(object);
  if (!equivalences.length) return { status: "unknown", statusLabel: "No degree-level equivalence listed" };
  const classes = equivalences.map(item => anabinText(item.equivalenceClass).toLowerCase());
  const positive = classes.some(text => ["entspricht", "gleichwertig"].includes(text));
  const conditional = equivalences.some(item => anabinText(item.comment).length > 0) || classes.some(text => text.includes("bedingt"));
  const negative = classes.some(text => text.includes("nicht") || text.includes("keine"));
  if (positive && !conditional && !negative) return { status: "equivalent", statusLabel: "Comparable / equivalent in Anabin" };
  if (conditional || (positive && negative)) return { status: "partial", statusLabel: "Conditions apply — individual review needed" };
  return { status: negative ? "negative" : "unknown", statusLabel: negative ? "Not comparable in Anabin" : "Equivalence needs review" };
}
export function mapAnabinMatches(kind: AnabinKind, data: unknown, query: string, institutionId = "", countryId = ""): AnabinMatch[] {
  if (!Array.isArray(data)) throw new Error("Invalid Anabin response");
  const seen = new Set<string>();
  return data.filter(visible).map(object).map(row => ({ row, rank: relevance(row, query) })).filter(({ row, rank }) => anabinId(row) && rank > 0)
    .sort((a, b) => b.rank - a.rank).flatMap(({ row }) => {
      const id = anabinId(row);
      if (seen.has(id)) return [];
      seen.add(id);
      const rowCountryId = anabinId(row.country);
      if (countryId && rowCountryId !== countryId) return [];
      const base = { id, kind, label: label(row), countryId: rowCountryId, country: countryLabel(row) };
      if (kind === "institution") {
        const status = anabinText(object(object(row.institutionType).status).nameShort).replace(/\s/g, "");
        return [{ ...base, subtitle: [anabinText(row.nameGerman), countryLabel(row)].filter(Boolean).join(" · "), status: status === "H+" ? "hplus" as const : status.includes("+/-") || status.includes("+/−") ? "conditional" as const : status === "H-" || status === "H−" ? "negative" as const : "unknown" as const, statusLabel: status || "Status not listed", association: "global" as const, sourceUrl: "https://anabin.kmk.org/db/institutionen" }];
      }
      const ids = array(row.institutions).filter(visible).map(anabinId).filter(Boolean);
      // Do not suggest another university's degree as if the selected institution offered it.
      if (institutionId && ids.length && !ids.includes(institutionId)) return [];
      const linked = !!institutionId && ids.includes(institutionId);
      const equivalence = degreeEquivalence(row);
      return [{ ...base, ...equivalence, subtitle: [label(object(row.fieldOfStudy)), countryLabel(row)].filter(Boolean).join(" · "), association: linked ? "institution" as const : institutionId ? "country" as const : "global" as const, sourceUrl: "https://anabin.kmk.org/db/hochschulabschluesse" }];
    }).slice(0, 8);
}
