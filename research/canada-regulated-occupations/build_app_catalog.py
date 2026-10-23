"""Build the app's reviewed, positive-only occupation catalogue.

Selections are explicit role/title mappings, never all aliases of a broad NOC.
Confirmed jurisdiction lists are not presented as exhaustive. Only an explicit
national source restriction may produce an 'only' label.
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RESEARCH = Path(__file__).resolve().parent
raw = json.loads((RESEARCH / "cicic-profiles.json").read_text(encoding="utf-8"))
profiles = {p["profileId"]: p for p in raw["profiles"]}
province_codes = {
    "Alberta": "AB", "British Columbia": "BC", "Manitoba": "MB",
    "New Brunswick": "NB", "Newfoundland and Labrador": "NL", "Nova Scotia": "NS",
    "Northwest Territories": "NT", "Nunavut": "NU", "Ontario": "ON",
    "Prince Edward Island": "PE", "Quebec": "QC", "Saskatchewan": "SK", "Yukon": "YT",
}
ALL = list(province_codes.values())
sources = {}
rows = []


def source(key, label, url):
    sources[key] = {"label": label, "url": url}
    return key


ON = source("ontario", "Government of Ontario", "https://www.ontario.ca/page/work-your-profession-or-trade")
MB = source("manitoba", "Government of Manitoba", "https://immigratemanitoba.com/work/regulated-occupations/")
SK = source("saskatchewan", "Government of Saskatchewan", "https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/to-work/regulated-occupations-and-licensing-requirements/saskatchewan-regulatory-bodies")
NB = source("new-brunswick", "Government of New Brunswick", "https://www2.gnb.ca/content/gnb/en/departments/post-secondary_education_training_and_labour/Jobs/content/LabourMobility/CertifiedOccupations.html")
PE = source("pei", "Government of Prince Edward Island", "https://www.princeedwardisland.ca/fr/information/main-doeuvre-et-etudes-superieures/regulated-occupations")
QC = source("quebec", "Government of Quebec", "https://www.quebec.ca/emploi/informer-metier-profession/ordres-professionnels/liste-repertoire-membres")
BC = source("bc", "Government of British Columbia", "https://www.privatetraininginstitutions.gov.bc.ca/node/146")
NS = source("nova-scotia", "Government of Nova Scotia — health regulators", "https://www.novascotia.ca/sites/default/files/documents/1-3973/health-profession-regulators-en.pdf")
NS_OTHER = source("ns-other", "Government of Nova Scotia — regulated occupations", "https://novascotia.ca/lae/fair-registration-practices/regulatory-bodies.asp")
NT = source("nwt", "Government of the Northwest Territories", "https://www.hss.gov.nt.ca/en/services/professional-licensing")
YT = source("yukon", "Government of Yukon — professional licensing", "https://yukon.ca/en/doing-business/professional-licensing")
TC = source("tc-ame", "Transport Canada — aircraft maintenance engineer licensing", "https://tc.canada.ca/en/aviation/licensing-aircraft-maintenance-engineers-ames/obtaining-aircraft-maintenance-engineer-ame-licence")
IRCC = source("ircc-representatives", "Government of Canada — authorized representatives", "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigration-citizenship-representative/choose/authorized.html")
ABA = source("cpbao", "College of Psychologists and Behaviour Analysts of Ontario", "https://cpbao.ca/aba/aba-information-and-updates/")
KINES = source("jobbank-kinesiologist", "Government of Canada Job Bank — kinesiologist", "https://www.jobbank.gc.ca/marketreport/requirements/25168/ca")
PSY_YT = source("yukon-psychology", "Government of Yukon — psychologist certification", "https://yukon.ca/en/doing-business/professional-licensing/apply-psychologist-certificate")
NP = source("jobbank-np", "Government of Canada Job Bank — nurse practitioner", "https://www.jobbank.gc.ca/marketreport/requirements/26454/ca")
CCQ = source("ccq", "Commission de la construction du Quebec — trade qualification examinations", "https://www.ccq.org/en/qualification-acces-industrie/examen-qualification-2/fiches-renseignements")
ENGINEERS = source("engineers-canada", "Engineers Canada — protected professional titles", "https://engineerscanada.ca/become-an-engineer/use-of-professional-title-and-designations")
AB_ROLES = source("alberta-role-inventory", "Government of Alberta — regulated professions inventory", "https://www.alberta.ca/system/files/jus-list-regulated-professions-under-review.pdf")
PHARM_TECH = source("jobbank-pharmacy-tech", "Government of Canada Job Bank — pharmacy technician", "https://www.jobbank.gc.ca/marketreport/requirements/25660/ca")
RESP = source("jobbank-respiratory", "Government of Canada Job Bank — respiratory therapist", "https://www.jobbank.gc.ca/marketreport/requirements/22796/ca")
FP = source("ontario-financial-titles", "Ontario legislation — financial professional titles", "https://www.ontario.ca/laws/statute/19f07b")
QC_PSYCH = source("quebec-psychotherapy", "Government of Quebec — psychotherapy permits", "https://www.quebec.ca/emploi/informer-metier-profession/profession-metier-reglemente/connaitre-professions-metiers-reglementes")


def add(title, sector, family, profession, jurisdictions, evidence, kind="practice-or-title", note="", coverage="confirmed"):
    import re
    identifier = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    if any(row["id"] == identifier for row in rows):
        raise ValueError(f"Duplicate occupation: {title}")
    rows.append({
        "id": identifier, "title": title, "sector": sector, "family": family,
        "profession": profession, "jurisdictions": [j for j in ALL if j in jurisdictions],
        "coverage": coverage, "regulation": kind, "note": note,
        "sourceIds": list(dict.fromkeys(evidence)),
    })


def cicic(profile_id, title, sector, family, profession, kind="practice-or-title", extra=None, note="", more_sources=None, complete=False):
    p = profiles[profile_id]
    if p["dataQualityFlags"]:
        raise ValueError(f"Unresolved research profile: {profile_id}")
    key = source("cicic-" + profile_id, "CICIC / Council of Ministers of Education, Canada", p["sourceUrl"])
    jurisdictions = [province_codes[j["jurisdiction"]] for j in p["jurisdictionsAsPublished"] if j["exclusivePractice"] or j["reservedTitle"]]
    jurisdictions += extra or []
    add(title, sector, family, profession, jurisdictions, [key] + (more_sources or []), kind, note, "canada-wide" if complete else "confirmed")


# Healthcare: use actual professions rather than the full mixed NOC group.
for pid, title, family in [
    ("43", "Family physician / general practitioner", "Medicine and nursing"),
    ("42", "Specialist physician / surgeon", "Medicine and nursing"),
    ("56", "Registered nurse", "Medicine and nursing"),
    ("70", "Licensed practical nurse", "Medicine and nursing"),
    ("44", "Dentist", "Dental and vision"),
    ("66", "Dental hygienist", "Dental and vision"),
    ("65", "Denturist", "Dental and vision"),
    ("46", "Optometrist", "Dental and vision"),
    ("50", "Pharmacist", "Pharmacy and diagnostics"),
]:
    cicic(pid, title, "health", family, "Healthcare", complete=True)
add("Nurse practitioner", "health", "Medicine and nursing", "Healthcare", ALL, [NP], coverage="canada-wide")
cicic("83", "Psychologist", "health", "Therapy and mental health", "Healthcare", extra=["YT"], more_sources=[PSY_YT], complete=True)
for pid, title, family, extra, evidence in [
    ("52", "Audiologist", "Therapy and mental health", ["NS", "PE"], [NS, PE]),
    ("52", "Speech-language pathologist", "Therapy and mental health", ["NS", "PE"], [NS, PE]),
    ("54", "Occupational therapist", "Therapy and mental health", [], []),
    ("53", "Physiotherapist", "Therapy and mental health", [], []),
    ("47", "Chiropractor", "Therapy and mental health", [], []),
    ("157", "Registered massage therapist", "Therapy and mental health", ["PE"], [PE]),
    ("51", "Registered dietitian", "Therapy and mental health", [], []),
    ("58", "Medical laboratory technologist", "Pharmacy and diagnostics", [], [NS, PE]),
    ("61", "Medical radiation technologist", "Pharmacy and diagnostics", ["PE"], [PE]),
    ("62", "Diagnostic medical sonographer", "Pharmacy and diagnostics", ["NS"], [NS]),
    ("144", "Electroencephalograph / electroneurophysiology technologist", "Pharmacy and diagnostics", [], []),
    ("137", "Certified dental assistant", "Dental and vision", [], []),
    ("67", "Registered dental technologist / technician", "Dental and vision", [], []),
    ("68", "Optician", "Dental and vision", [], []),
    ("71", "Paramedic", "Medicine and nursing", [], []),
]:
    cicic(pid, title, "health", family, "Healthcare", extra=extra, more_sources=evidence)
for title, family, places, evidence, kind, note in [
    ("Registered psychiatric nurse", "Medicine and nursing", ["AB", "BC", "MB", "SK", "YT"], [AB_ROLES, MB, SK, BC, YT], "practice-or-title", "A distinct nursing designation; this does not classify every psychiatric-care role."),
    ("Physician assistant", "Medicine and nursing", ["AB", "PE", "NS"], [AB_ROLES, PE, NS], "practice-or-title", "Requirements depend on the jurisdiction and permitted scope of practice."),
    ("Midwife", "Medicine and nursing", ["BC", "MB", "NB", "NS", "NT", "ON", "PE", "QC", "SK", "YT"], [BC, MB, NB, NS, NT, ON, PE, QC, SK, YT], "practice-or-title", ""),
    ("Pharmacy technician", "Pharmacy and diagnostics", ["AB", "BC", "MB", "NB", "NL", "NS", "ON", "PE", "SK"], [PHARM_TECH, BC, NB, NS, PE, SK], "practice-or-title", "The regulated technician role is different from a pharmacy assistant."),
    ("Respiratory therapist", "Pharmacy and diagnostics", ["AB", "MB", "NB", "NL", "NS", "ON", "PE", "QC", "SK"], [RESP, MB, NB, NS, ON, PE, QC, SK], "practice-or-title", ""),
    ("Medical laboratory assistant", "Pharmacy and diagnostics", ["NS"], [NS], "practice-or-title", "The Nova Scotia government lists laboratory assistants under its medical laboratory regulator."),
    ("Combined laboratory and X-ray technologist", "Pharmacy and diagnostics", ["NS"], [NS], "practice-or-title", ""),
    ("Hearing instrument practitioner", "Dental and vision", ["BC", "QC", "SK"], [BC, QC, SK], "practice-or-title", ""),
    ("Dental therapist", "Dental and vision", ["BC", "SK", "YT", "NT"], [BC, SK, YT, NT], "practice-or-title", ""),
    ("Podiatrist / chiropodist", "Therapy and mental health", ["MB", "NB", "NS", "ON", "PE", "QC", "SK"], [MB, NB, NS, ON, PE, QC, SK], "practice-or-title", "The permitted professional title and activities differ by jurisdiction."),
    ("Naturopathic doctor / practitioner", "Therapy and mental health", ["BC", "MB", "NS", "NT", "ON", "SK"], [BC, MB, NS, NT, ON, SK], "practice-or-title", ""),
    ("Acupuncturist", "Therapy and mental health", ["BC", "ON", "PE", "QC"], [BC, ON, PE, QC], "practice-or-title", ""),
    ("Traditional Chinese medicine practitioner", "Therapy and mental health", ["BC", "ON"], [BC, ON], "practice-or-title", ""),
    ("Homeopath", "Therapy and mental health", ["ON"], [ON], "practice-or-title", ""),
    ("Kinesiologist", "Therapy and mental health", ["ON"], [KINES, ON], "practice-or-title", "Job Bank identifies Ontario registration for the kinesiologist profession."),
    ("Behaviour analyst", "Therapy and mental health", ["ON"], [ABA], "title", "Ontario protects the title Behaviour Analyst. Related ABA activities are not themselves controlled acts."),
    ("Registered psychotherapist", "Therapy and mental health", ["ON", "QC"], [ON, QC_PSYCH], "practice-or-title", "Quebec also regulates psychotherapy through a psychotherapist permit; check the exact permitted title."),
    ("Counselling therapist", "Therapy and mental health", ["NB", "NS", "PE"], [NB, NS, PE], "practice-or-title", ""),
    ("Marriage and family therapist", "Therapy and mental health", ["QC"], [QC], "title", "This entry concerns the protected professional title in the cited jurisdiction."),
    ("Psychoeducator", "Therapy and mental health", ["QC"], [QC], "title", ""),
    ("Sexologist", "Therapy and mental health", ["QC"], [QC], "title", ""),
]:
    add(title, "health", family, "Healthcare", places, evidence, kind, note)

# Professional engineering titles and related licensed/protected professions.
for pid, title in [
    ("25", "Aerospace engineer"), ("193", "Chemical engineer"), ("188", "Civil engineer"),
    ("192", "Electrical / electronics engineer"), ("197", "Geological engineer"),
    ("194", "Industrial / manufacturing engineer"), ("191", "Mechanical engineer"),
    ("195", "Metallurgical / materials engineer"), ("196", "Mining engineer"),
    ("199", "Petroleum engineer"), ("26", "Professional engineer — other discipline"),
]:
    cicic(pid, title, "science", "Professional engineering", "Engineering", complete=True,
          note="Professional engineering practice and titles are regulated. Supervised-work exceptions may apply.")
add("Computer engineer", "science", "Professional engineering", "Engineering", ALL,
    [ENGINEERS], note="This entry concerns professional engineering practice and protected engineering titles.", coverage="canada-wide")
add("Software engineer — protected engineering title", "science", "Professional engineering", "Engineering", ["BC", "ON", "SK"],
    [BC, ON, SK, ENGINEERS], "title", "Ordinary software development is generally unregulated. Alberta has a software-engineer title exception; professional engineering activities may still be regulated.")
for pid, title, family in [
    ("27", "Architect", "Architecture and surveying"),
    ("28", "Landscape architect", "Architecture and surveying"),
    ("30", "Land surveyor", "Architecture and surveying"),
    ("29", "Registered professional planner", "Architecture and surveying"),
    ("20", "Registered professional biologist", "Science and professional titles"),
    ("18", "Professional / chartered chemist", "Science and professional titles"),
]:
    cicic(pid, title, "science", family, "Science and design", kind="practice-or-title" if pid in ("27", "28", "30") else "title", complete=pid == "30")
add("Professional geoscientist / geologist", "science", "Science and professional titles", "Geoscience",
    ["BC", "MB", "NB", "NL", "ON", "QC", "SK"], [MB, NB, ON, QC, SK, BC], "practice-or-title")
add("Registered interior designer", "science", "Architecture and surveying", "Interior design",
    ["NB", "NS", "ON", "SK"], [NB, SK, ON, NS_OTHER], "title",
    "Protected professional designations do not mean every interior decorator needs a practice licence.")
for title in ["Certified engineering technologist", "Certified technician", "Professional technologist"]:
    add(title, "science", "Science and professional titles", "Technical professional title", ["AB"], [AB_ROLES], "title",
        "Registration protects the specified designation. General technician or technologist work is not automatically restricted.")
add("Information Systems Professional (I.S.P.)", "science", "Science and professional titles", "Information technology",
    ["SK"], [SK], "title", "This is a protected professional designation, not a licence requirement for every developer or IT role.")

# Education and social-service professions.
for pid, title in [("115", "Elementary school / kindergarten teacher"), ("80", "Secondary school teacher")]:
    cicic(pid, title, "education", "Teaching and childcare", "Education", complete=True)
cicic("578", "Early childhood educator", "education", "Teaching and childcare", "Early childhood education",
      extra=["NB"], more_sources=[NB, PE], note="Requirements for assistants and related childcare jobs may differ.")
cicic("84", "Registered social worker", "education", "Social and community services", "Social work", kind="title")
add("Registered social service worker", "education", "Social and community services", "Social services", ["ON"], [ON], "title")
add("Guidance counsellor — protected professional title", "education", "Social and community services", "Counselling", ["QC"], [QC], "title")
add("Registered music teacher", "education", "Teaching and childcare", "Music education", ["SK", "NS"], [SK, NS_OTHER], "title",
    "This concerns the registered title; it does not classify all private music teaching as regulated.")

# Legal services, including the explicitly supported Ontario-only case.
cicic("75", "Lawyer", "law", "Legal professions", "Law", complete=True)
add("Paralegal", "law", "Legal professions", "Law", ["ON"], [IRCC, source("cicic-152", "CICIC / Council of Ministers of Education, Canada", profiles["152"]["sourceUrl"])],
    note="The licensed independent paralegal profession has an Ontario-specific scope of practice.", coverage="exclusive")
add("Quebec notary", "law", "Legal professions", "Notarial law", ["QC"], [QC, IRCC], "practice-or-title")
add("Regulated Canadian immigration consultant", "law", "Immigration services", "Immigration advice", ALL, [IRCC],
    note="Paid immigration or citizenship advice must be provided by an authorized representative.", coverage="federal")
add("Criminologist — protected professional title", "law", "Legal professions", "Criminology", ["QC"], [QC], "title")

# Financial and property roles: do not include generic accounting or HR jobs.
cicic("10", "Chartered professional accountant (CPA)", "finance", "Accounting and financial services", "Accounting", "title", complete=True,
      note="CPA is a protected professional designation; ordinary bookkeeping is not classified by this entry.")
cicic("148", "Licensed insurance adjuster", "finance", "Accounting and financial services", "Insurance", complete=True,
      note="This entry is for licensed adjusting work, not every insurance claims-processing job.")
cicic("98", "Insurance agent / broker", "finance", "Accounting and financial services", "Insurance", complete=True)
cicic("12", "Securities dealer / registered investment representative", "finance", "Accounting and financial services", "Investment services", complete=True)
cicic("99", "Real estate agent / broker", "finance", "Real estate and property", "Real estate", complete=True)
cicic("16", "Accredited / chartered property assessor", "finance", "Real estate and property", "Property assessment", kind="title")
add("Mortgage broker", "finance", "Real estate and property", "Mortgage services", ["NB", "NS"], [NB, NS_OTHER])
add("Financial planner — regulated professional title", "finance", "Accounting and financial services", "Financial planning", ["ON", "QC"],
    [FP, source("qc-regulated-work", "Government of Quebec — regulated financial occupations", "https://www.quebec.ca/en/employment/learn-trade-occupation/practising-regulated-trade-occupation/learn-regulated-trades-occupations")], "title")
add("Financial advisor — protected professional title", "finance", "Accounting and financial services", "Financial advice", ["ON"], [FP], "title")
cicic("13", "Certified human resources professional designation", "finance", "Other protected professional titles", "Human resources", kind="title",
      note="Only the protected professional designation is classified here; general HR and recruitment work is not automatically regulated.")
add("Chartered administrator", "finance", "Other protected professional titles", "Administration", ["QC"], [QC], "title")

# Compulsory trades: exact roles from government lists, with CCQ scope retained.
trade_sources = [ON, MB, PE, BC, CCQ]
for title, family, places in [
    ("Construction / maintenance electrician", "Electrical and building systems", ["BC", "MB", "ON", "PE", "QC", "SK"]),
    ("Industrial electrician", "Electrical and building systems", ["BC", "MB", "ON"]),
    ("Domestic / rural electrician", "Electrical and building systems", ["ON"]),
    ("Powerline technician", "Electrical and building systems", ["BC"]),
    ("Gasfitter", "Electrical and building systems", ["BC", "SK"]),
    ("Refrigeration / air conditioning mechanic", "Electrical and building systems", ["BC", "MB", "ON", "QC", "SK"]),
    ("Residential air conditioning systems mechanic", "Electrical and building systems", ["ON"]),
    ("Plumber", "Plumbing and metalwork", ["ON", "PE", "QC", "SK"]),
    ("Steamfitter / pipefitter", "Plumbing and metalwork", ["BC", "MB", "ON", "PE", "QC"]),
    ("Sprinkler / fire protection installer", "Plumbing and metalwork", ["MB", "ON", "QC"]),
    ("Sheet metal worker", "Plumbing and metalwork", ["BC", "ON", "QC", "SK"]),
    ("Residential sheet metal installer", "Plumbing and metalwork", ["ON"]),
    ("Boilermaker", "Plumbing and metalwork", ["QC"]),
    ("Ironworker", "Plumbing and metalwork", ["QC"]),
    ("Reinforcing steel erector", "Plumbing and metalwork", ["QC"]),
    ("Automotive service technician", "Vehicles and equipment", ["ON", "PE"]),
    ("Truck and coach technician", "Vehicles and equipment", ["ON"]),
    ("Truck-trailer service technician", "Vehicles and equipment", ["ON"]),
    ("Motorcycle technician", "Vehicles and equipment", ["ON"]),
    ("Transmission technician", "Vehicles and equipment", ["ON"]),
    ("Alignment and brakes technician", "Vehicles and equipment", ["ON"]),
    ("Automotive electronic accessory technician", "Vehicles and equipment", ["ON"]),
    ("Auto body / collision repairer", "Vehicles and equipment", ["ON"]),
    ("Heavy equipment mechanic — construction", "Vehicles and equipment", ["QC"]),
    ("Millwright — construction", "Vehicles and equipment", ["QC"]),
    ("Elevator constructor / mechanic", "Electrical and building systems", ["ON", "PE", "QC"]),
    ("Security systems installer — construction", "Electrical and building systems", ["QC"]),
    ("Crane / hoisting equipment operator", "Construction and site work", ["MB", "ON", "QC", "SK"]),
    ("Carpenter-joiner — construction", "Construction and site work", ["QC"]),
    ("Bricklayer-mason — construction", "Construction and site work", ["QC"]),
    ("Cement finisher — construction", "Construction and site work", ["QC"]),
    ("Erector mechanic / glazier — construction", "Construction and site work", ["QC"]),
    ("Insulator — construction", "Construction and site work", ["QC"]),
    ("Interior systems installer — construction", "Construction and site work", ["QC"]),
    ("Painter — construction", "Construction and site work", ["QC"]),
    ("Plasterer — construction", "Construction and site work", ["QC"]),
    ("Resilient flooring layer — construction", "Construction and site work", ["QC"]),
    ("Roofer — construction", "Construction and site work", ["QC"]),
    ("Shovel / heavy equipment operator — construction", "Construction and site work", ["QC"]),
    ("Tilesetter — construction", "Construction and site work", ["QC"]),
]:
    # Only cite the relevant provincial evidence, not all government lists.
    evidence = [s for j, s in [("ON", ON), ("MB", MB), ("PE", PE), ("BC", BC), ("QC", CCQ), ("SK", SK)] if j in places]
    add(title, "trades", family, "Skilled trade", places, evidence,
        note="Certification may require registration as an apprentice or a qualified tradesperson. Quebec entries concern construction work within the CCQ system; exemptions and work scope matter.")

# Transportation: federal scope is retained instead of a provincial inference.
for pid, title in [("37", "Commercial pilot / flight instructor"), ("38", "Air traffic controller")]:
    cicic(pid, title, "transport", "Aviation", "Aviation", complete=True)
    rows[-1]["coverage"] = "federal"
add("Aircraft maintenance engineer (AME)", "transport", "Aviation", "Aircraft maintenance", ALL, [TC],
    note="The AME licence authorizes certification of maintenance; not every aircraft mechanic role requires it.", coverage="federal")

# Environment, animal health and utilities.
cicic("22", "Professional agrologist", "environment", "Agriculture and forestry", "Agrology", kind="title")
cicic("21", "Registered professional forester", "environment", "Agriculture and forestry", "Forestry", kind="title")
cicic("45", "Veterinarian", "environment", "Veterinary care", "Veterinary medicine")
cicic("59", "Registered veterinary technologist / technician", "environment", "Veterinary care", "Veterinary technology", kind="title")
for title, family, places, evidence in [
    ("Power engineer", "Utilities and environmental safety", ["SK", "PE"], [SK, PE]),
    ("Pressure equipment inspector", "Utilities and environmental safety", ["SK"], [SK]),
    ("Water / wastewater operator", "Utilities and environmental safety", ["SK", "PE", "NS"], [SK, PE, NS_OTHER]),
    ("Well driller", "Utilities and environmental safety", ["NS", "PE"], [NS_OTHER, PE]),
    ("Pesticide applicator", "Utilities and environmental safety", ["NS"], [NS_OTHER]),
    ("Petroleum storage tank installer", "Utilities and environmental safety", ["NS", "PE"], [NS_OTHER, PE]),
    ("Septic system contractor", "Utilities and environmental safety", ["NS", "PE"], [NS_OTHER, PE]),
    ("Timber scaler", "Agriculture and forestry", ["NS"], [NS_OTHER]),
    ("Hunting / fishing guide", "Agriculture and forestry", ["NS"], [NS_OTHER]),
]:
    add(title, "environment", family, "Environment and utilities", places, evidence)

# Other statutory licences and explicitly protected titles.
for title, family, profession, places, evidence, kind in [
    ("Security guard", "Security and investigation", "Security", ["SK", "PE", "YT"], [SK, PE, YT], "practice-or-title"),
    ("Private investigator", "Security and investigation", "Investigation", ["SK", "PE"], [SK, PE], "practice-or-title"),
    ("Funeral director", "Funeral services", "Funeral services", ["MB", "NB", "NS", "PE", "SK", "YT"], [MB, NB, NS_OTHER, PE, SK, YT], "practice-or-title"),
    ("Embalmer", "Funeral services", "Funeral services", ["NB", "NS", "PE", "SK"], [NB, NS_OTHER, PE, SK], "practice-or-title"),
    ("Hairstylist / hairdresser", "Personal care", "Personal care", ["MB", "NS", "ON", "PE"], [MB, NS_OTHER, ON, PE], "practice-or-title"),
    ("Registered barber", "Personal care", "Personal care", ["NB", "NS"], [NB, NS_OTHER], "practice-or-title"),
    ("Cosmetologist", "Personal care", "Personal care", ["NB", "NS"], [NB, NS_OTHER], "practice-or-title"),
    ("Esthetician", "Personal care", "Personal care", ["MB"], [MB], "practice-or-title"),
    ("Electrologist", "Personal care", "Personal care", ["MB"], [MB], "practice-or-title"),
    ("Building official", "Inspection and administration", "Building inspection", ["NB", "SK"], [NB, SK], "practice-or-title"),
    ("Municipal administrator", "Inspection and administration", "Municipal administration", ["SK"], [SK], "practice-or-title"),
]:
    add(title, "other", family, profession, places, evidence, kind)
for title in ["Certified translator", "Certified terminologist", "Certified interpreter"]:
    cicic("94", title, "other", "Language professional titles", "Language services", kind="title",
          note="The certified professional title is protected; this does not classify all translation or interpreting work as restricted.")

# These broad or inconsistent source records must never be promoted as-is.
excluded = [
    {"profileId": p["profileId"], "directoryTitle": p["directoryTitle"], "reasons": p["dataQualityFlags"]}
    for p in raw["profiles"] if p["dataQualityFlags"]
]
catalog = {
    "reviewedOn": "2026-10-23", "sources": sources,
    "occupations": sorted(rows, key=lambda row: row["title"].casefold()),
}
destination = ROOT / "lib" / "data" / "canada-regulated-occupations.json"
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(RESEARCH / "app-catalog-review.json").write_text(json.dumps({
    "reviewedOn": catalog["reviewedOn"], "publishedOccupationCount": len(rows),
    "coveragePolicy": "Positive-only, role-scoped findings. Confirmed locations are not exhaustive. Ontario-only paralegal scope is explicitly sourced. No-match is not a definitive unregulated finding.",
    "isExhaustiveLegalOccupationList": False,
    "excludedUnresolvedProfiles": excluded,
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Built {len(rows)} role-scoped occupations from {len(sources)} official source references.")
