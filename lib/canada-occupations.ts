import catalog from "@/lib/data/canada-regulated-occupations.json";

export const JURISDICTIONS = {
  AB: "Alberta",
  BC: "British Columbia",
  MB: "Manitoba",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NS: "Nova Scotia",
  NT: "Northwest Territories",
  NU: "Nunavut",
  ON: "Ontario",
  PE: "Prince Edward Island",
  QC: "Quebec",
  SK: "Saskatchewan",
  YT: "Yukon",
} as const;

export const OCCUPATION_SECTORS = [
  { id: "health", label: "Healthcare" },
  { id: "science", label: "Engineering, science and design" },
  { id: "education", label: "Education and social services" },
  { id: "law", label: "Law and immigration" },
  { id: "finance", label: "Finance, insurance and professional designations" },
  { id: "trades", label: "Construction and mechanical trades" },
  { id: "transport", label: "Aviation and transport" },
  { id: "environment", label: "Agriculture, veterinary care and utilities" },
  { id: "other", label: "Other licensed services and protected titles" },
] as const;

export type JurisdictionCode = keyof typeof JURISDICTIONS;
export type OccupationSector = (typeof OCCUPATION_SECTORS)[number]["id"];

export interface RegulatedOccupation {
  id: string;
  title: string;
  sector: OccupationSector;
  family: string;
  profession: string;
  jurisdictions: JurisdictionCode[];
  coverage: "canada-wide" | "federal" | "exclusive" | "confirmed";
  regulation: "practice-or-title" | "title";
  note: string;
  sourceIds: string[];
}

export interface OccupationSource {
  label: string;
  url: string;
}

const reviewedCatalog = catalog as {
  reviewedOn: string;
  sources: Record<string, OccupationSource>;
  occupations: RegulatedOccupation[];
};

export const REGULATED_OCCUPATIONS: readonly RegulatedOccupation[] = reviewedCatalog.occupations;
export const OCCUPATION_SOURCES = reviewedCatalog.sources;
export const OCCUPATIONS_REVIEWED_ON = reviewedCatalog.reviewedOn;

/** Confirmed locations never imply that all other jurisdictions are unregulated. */
export function getOccupationLocationLabel(occupation: RegulatedOccupation): string {
  if (occupation.coverage === "federal") return "Canada-wide, federal";
  if (occupation.coverage === "canada-wide") return "Canada-wide";

  const names = occupation.jurisdictions.map((code) => JURISDICTIONS[code]);
  if (occupation.coverage === "exclusive") return `${names.join(", ")} only`;

  const provinces = Object.keys(JURISDICTIONS).filter((code) => !["NT", "NU", "YT"].includes(code));
  const allProvinces = occupation.jurisdictions.length === 10 &&
    provinces.every((code) => occupation.jurisdictions.includes(code as JurisdictionCode));
  if (allProvinces) return "All 10 provinces; confirmed";

  const places = names.length <= 3 ? names.join(", ") : occupation.jurisdictions.join(", ");
  return `${places}; confirmed`;
}

export function getOccupationOptionLabel(occupation: RegulatedOccupation): string {
  return `${occupation.title} (${occupation.profession} — ${getOccupationLocationLabel(occupation)})`;
}
