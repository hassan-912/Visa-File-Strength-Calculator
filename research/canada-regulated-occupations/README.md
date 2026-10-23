# Canada occupation regulation: research and proposed selection flow

Reviewed on 23 October 2026. Requested scope: all Canada, with no province selector.

This folder contains the source research and catalogue builder for the Canada occupation selector. The selector is now implemented above the Canada CRS form. It does not calculate immigration eligibility or award CRS points.

## Implemented catalogue

The application uses `lib/data/canada-regulated-occupations.json`, built by `build_app_catalog.py`: **165 specific regulated roles and protected professional titles** with **86 official source references**. The larger raw research files are not shipped to the browser.

`components/CanadaOccupationChecker.tsx` provides the field, optional profession group, occupation selector, result and source links. `lib/canada-occupations.ts` formats each label as **Occupation (Profession — Location)**.

- A national source explicitly supports **Paralegal (Law — Ontario only)**. The app does not infer exclusivity merely because a source identifies only one location.
- Other partial geographical findings use **confirmed**. Selecting an occupation shows the full province/territory names and the supporting sources.
- Professional engineering, CPA, certified translator and similar titles are scoped so that ordinary software development, bookkeeping, general translation and other unregulated related work are not automatically classified as regulated.
- Current supplements include Yukon psychologist certification and Ontario financial-professional title legislation. Contradictory broad directory records are excluded as direct selection sources.
- There are nine fields. Healthcare, engineering/science and trades have a further profession-group selector, keeping the occupation lists shorter.
- None is the first selectable option; the result is **No regulated occupation identified**, not a definitive legal finding that every possible activity is unregulated.

The catalogue is a source-backed positive list, not a certified exhaustive inventory of every regulated activity in Canada. Where a source does not establish the complete national geography, the app preserves that limitation in the label instead of inventing an “only” restriction. See `app-catalog-review.json` for excluded unresolved source records.

## Recommended interface

Use progressive selection instead of a free-text input or one enormous dropdown:

1. **Occupation sector**: put **None of these occupations** first, followed by the sectors below. Start with an unanswered placeholder; do not silently select None.
2. **Profession**: show only the occupations in the selected sector. Large sectors may use a short subcategory step before the profession, for example Health → Dental → Dental hygienist.
3. **Result**: show the Canada-wide finding with a link to its official source. Do not require a province selection.

Proposed sectors (interface groupings, not government classifications):

- Health and care
- Engineering, science and technical professions
- Education and social services
- Law and immigration services
- Finance, insurance and real estate
- Construction and mechanical trades
- Aviation, marine and transport
- Agriculture, environment and utilities
- Other licensed services: security, funeral services, personal care, and other protected professional titles

Only include sourced regulated professions, protected titles, and compulsory occupations in the profession choices. Do not list every NOC alias: an occupational group may contain both regulated and unregulated jobs. Optional trade certification and ordinary employer preferences must not be presented as mandatory regulation.

### Meaning of the result

Without a province selection, a positive finding can mean **regulated in at least one Canadian jurisdiction**, including applicable federal regulation. It cannot establish that the work needs a licence everywhere in Canada.

Recommended result text:

- Matching profession: **Regulated in Canada** — “This occupation or professional title is regulated in at least one province or territory, or under federal rules. Requirements depend on where you work and the activities you perform.”
- Reserved-title-only match: add **Protected professional title**, explaining that registration protects the title and may not restrict all related work.
- None: **No regulated occupation identified** — “You have not selected an occupation from this regulated-occupation list. This is not confirmation that every activity or title in your role is unrestricted.”
- If the client cannot identify a matching title, an optional **Not sure** choice should preserve an unknown result rather than classify them as unregulated.

The requested rule “None means definitely unregulated” is not established by these sources. Directory omissions, mixed job groups, special duties, protected titles, and changing provincial rules prevent that inference. This is a material limitation of a national yes/no checker, not a reason to add a province selector against the requested design.

## Evidence collected

- `cicic-profiles.json`: all **135 results** across all **5 pages** of CICIC's regulated search, representing **133 distinct NOC 2021 codes as published**. Each profile includes the published classification for **13 provinces and territories**, a source URL, and a short regulatory-scope excerpt. These counts describe source records, not 135 verified individual regulated jobs.
- `government-lists.json`: source inventories from government pages for Saskatchewan, Ontario, Quebec, Manitoba, New Brunswick, and Prince Edward Island. Multiple sources may describe the same occupation. These lists still need role and title scope review before becoming client choices.
- `web-source-rows.json`: official-page rows returned by web retrieval for Manitoba, New Brunswick and PEI, where direct retrieval returned HTTP 403 or did not expose the table. Their retrieval method and snapshot date are explicit.
- `bc-government-roles.json`: 13 regulator/occupation-group rows from the BC government's Private Training Institutions Regulatory Unit. Rows in its separate non-regulator section were excluded.
- `source-register.json`: additional government and statutory-regulator sources, with their scope and limitations.

No unofficial immigration blog, commercial job list, or unsourced remembered occupation was used as evidence for the saved source inventories.

## Why the CICIC search cannot be copied directly into the UI

The directory is an official CMEC resource and a useful starting point, but the retrieved material has internal inconsistencies. **12 profiles** were flagged for missing classifications, incomplete content, absent scope text, or conflicting source statements. Every other profile still needs role-scope review; absence of a quality flag does not make it production ready.

Examples found in the actual retrieved pages:

- Profile **205**, directory label **Data scientists**: its regulatory narrative describes engineers. This record must not be used to declare data scientists regulated.
- Profile **85**, directory label **Physician assistants, midwives and allied health professionals**: its regulatory narrative describes counselling occupations. The roles must be split and verified independently.
- Profiles **217** and **361**, directory labels **Storekeepers and partspersons** and **Nurse aides, orderlies and patient service associates**: their narratives describe unregulated work despite inclusion in the regulated search.
- Profile **529**, **Nursing coordinators and supervisors**: the source explicitly says its regulatory content is still being adjusted.
- Human resources groups include protected professional designations; this does not make every recruiter or general HR position subject to a compulsory practice licence.

Current regulator sources also add material beyond the search. Ontario's statutory regulator confirms **Behaviour Analyst** is a restricted title from 1 July 2024, while the activities of applied behaviour analysis are not themselves controlled acts. This is exactly why title protection must be distinguished from a blanket licence requirement.

## Source policy for the eventual app catalogue

For each selectable profession, preserve:

- A precise client-facing role or protected title, with a stable internal ID.
- Its display sector and, if needed, profession family.
- Whether the rule protects practice, title, or both.
- At least one applicable Canadian jurisdiction, even though the interface will not ask the client to choose one.
- Its government or statutory-regulator source URL and date checked.
- Any scope limitation, supervised-practice exception, or pending change needed to avoid a false result.
- A review state. Unknown, contradictory, or outdated evidence must not be promoted to a verified classification.

Do not automatically turn every group in the source JSON into a selectable regulated job. Do not apply an occupational licence to the CRS trade-certificate field: a professional licence and a Canadian trade certificate are different credentials.

This research captures the full CICIC regulated-search snapshot plus government supplements. **It is not a certified exhaustive list of every legally regulated activity or occupational title in Canada, and is deliberately not marked production ready.** A definitive “unregulated” result is not supported by absence from this collection.

## Repeating the collection

The collectors require Python 3 and `requests`; they do not add runtime dependencies to the Next.js app.

From the repository root:

```powershell
python research/canada-regulated-occupations/collect_cicic.py
python research/canada-regulated-occupations/collect_government_lists.py
python research/canada-regulated-occupations/build_app_catalog.py
```

The CICIC collector checks pagination counts, distinct profile IDs, and the presence of all 13 jurisdiction rows. Source data and review flags are preserved rather than silently repaired. The government collector retains the dated web-retrieval fallback when direct retrieval is unavailable. Recheck those fallbacks against their official sources when refreshing the catalogue.

## Validation

The production build and TypeScript check passed. Targeted ESLint reported no errors; the immigration page retains its pre-existing image-element warning. Catalogue checks cover unique role IDs, source references, valid non-duplicate jurisdictions, national scope, the explicit Ontario-only case, and exclusion of contradictory broad occupation groups. Browser checks cover field changes, the None option, protected-title wording, Canada/Australia separation, and a real-page mobile preview at 390 pixels wide.
