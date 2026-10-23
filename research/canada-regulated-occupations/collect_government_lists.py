"""Preserve occupation names and regulator links from official government lists.

These are source inventories, not a claim that every role in each broad group
requires a licence. All entries still need title/practice scope review.
"""

from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html import unescape
import json
from pathlib import Path
import re
from urllib.parse import urljoin

from collect_cicic import get, plain


SOURCES = [
    ("Manitoba", "https://immigratemanitoba.com/work/regulated-occupations/", "tables"),
    ("Saskatchewan", "https://www.saskatchewan.ca/residents/moving-to-saskatchewan/live-in-saskatchewan/to-work/regulated-occupations-and-licensing-requirements/saskatchewan-regulatory-bodies", "tables"),
    ("New Brunswick", "https://www2.gnb.ca/content/gnb/en/departments/post-secondary_education_training_and_labour/Jobs/content/LabourMobility/CertifiedOccupations.html", "tables"),
    ("Prince Edward Island", "https://www.princeedwardisland.ca/fr/information/main-doeuvre-et-etudes-superieures/regulated-occupations", "tables"),
    ("Ontario", "https://www.ontario.ca/page/work-your-profession-or-trade", "tables"),
    ("Quebec", "https://www.quebec.ca/emploi/informer-metier-profession/ordres-professionnels/liste-repertoire-membres", "quebec-professions"),
]


def collect(source):
    province, url, kind = source
    try:
        markup = get(url)
        entries = []
        if kind == "tables":
            for table in re.finditer(r"<table\b.*?</table>", markup, re.S):
                if not re.search(r"Regulatory|Profession|Occupation", plain(table.group()), re.I):
                    continue
                for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", table.group(), re.S):
                    cells = re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)
                    if len(cells) < 2:
                        continue
                    title, authority = map(plain, cells[:2])
                    if not title or title.lower() in ("occupation", "occupation name", "profession, trade or sector", "noc 2021 code"):
                        continue
                    if "not regulated" in authority.lower():
                        continue
                    links = [urljoin(url, unescape(x)) for x in re.findall(r'href=[\"\']([^\"\']+)', cells[1]) if not x.startswith("mailto:")]
                    entries.append({"labelAsPublished": title, "secondColumnAsPublished": authority, "linkedAuthorityUrls": links})
        else:
            start = markup.find("Liste des professions par ordre alphabétique")
            if start < 0:
                raise ValueError("Professional-list heading not found")
            section = re.split(r"</(?:main|article)>", markup[start:], maxsplit=1)[0]
            for href, label in re.findall(r'<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>', section, re.S):
                text = plain(label)
                # The profession directory links the professional orders;
                # exclude social sharing, menus and government navigation.
                if not text or href.startswith(("#", "mailto:", "/")) or re.match(r"https?://(?:www\.)?quebec\.ca/", href):
                    continue
                entries.append({"labelAsPublished": text, "linkedAuthorityUrls": [unescape(href)]})
        if not entries:
            raise ValueError("No occupation entries extracted; inspect source structure")
        print(f"{province}: {len(entries)} official source rows", flush=True)
        return {"jurisdiction": province, "sourceUrl": url, "sourceType": "government", "status": "collected", "entries": entries, "productionReady": False}
    except Exception as error:
        print(f"{province}: source unavailable ({error})", flush=True)
        return {"jurisdiction": province, "sourceUrl": url, "sourceType": "government", "status": "unavailable", "error": str(error), "entries": [], "productionReady": False}


if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=3) as pool:
        sources = list(pool.map(collect, SOURCES))
    fallback_path = Path(__file__).with_name("web-source-rows.json")
    if fallback_path.exists():
        fallback = json.loads(fallback_path.read_text(encoding="utf-8"))
        indexed = {source["jurisdiction"]: source for source in fallback["sources"]}
        sources = [indexed.get(source["jurisdiction"], source) if source["status"] == "unavailable" else source for source in sources]
    result = {
        "retrievedAtUtc": datetime.now(timezone.utc).isoformat(),
        "purpose": "Supplement and cross-check the CICIC search; source labels are preserved without silently converting groups into regulated individual jobs.",
        "productionReady": False,
        "isExhaustiveLegalOccupationList": False,
        "fallbackSnapshotReviewedOn": "2026-10-23",
        "sources": sources,
    }
    Path(__file__).with_name("government-lists.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
