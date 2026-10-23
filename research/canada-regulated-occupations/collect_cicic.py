"""Collect factual research from CICIC's public regulated-occupation directory.

Research only: broad NOC groups and their aliases are NOT a binary job classifier.
Run from the repository root with Python 3 and requests installed.
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from html import unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import time
from urllib.parse import urljoin

import requests


DIRECTORY = "https://www.cicic.ca/935/find_an_occupational_profile.canada?search=&cat=1&cid="
OUTPUT = Path(__file__).resolve().parent
CATEGORIES = {
    "0": "Management",
    "1": "Business, finance and administration",
    "2": "Natural and applied sciences and related occupations",
    "3": "Health",
    "4": "Education, law, social, community and government services",
    "5": "Art, culture, recreation and sport",
    "6": "Sales and service",
    "7": "Trades, transport and equipment operators",
    "8": "Natural resources and agriculture",
    "9": "Manufacturing and utilities",
}
JURISDICTIONS = {
    "Alberta", "British Columbia", "Manitoba", "New Brunswick",
    "Newfoundland and Labrador", "Nova Scotia", "Northwest Territories",
    "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon",
}


def plain(markup):
    return " ".join(unescape(re.sub(r"<[^>]+>", " ", markup)).split())


class FormInputs(HTMLParser):
    def __init__(self):
        super().__init__()
        self.fields = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        kind = attrs.get("type", "text")
        if tag != "input" or not attrs.get("name") or kind in ("submit", "button"):
            return
        if kind in ("checkbox", "radio") and "checked" not in attrs:
            return
        self.fields[attrs["name"]] = attrs.get("value", "on" if kind == "checkbox" else "")


def get(url):
    for attempt in range(3):
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            response.encoding = "utf-8"
            return response.text
        except requests.RequestException:
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


def collect_index():
    session = requests.Session()
    response = session.get(DIRECTORY, timeout=30)
    rows = []
    expected = None
    page = 0
    while True:
        response.raise_for_status()
        response.encoding = "utf-8"
        markup = response.text
        pager = re.search(r"(\d+) resultats sur (\d+) pages", markup)
        if not pager:
            raise ValueError("Directory result count was not found; review the source HTML.")
        expected, pages = map(int, pager.groups())
        page += 1
        for row in re.findall(r'<tr class="rg(?:Alt)?Row".*?</tr>', markup, re.S):
            cells = re.findall(r"<td[^>]*>(.*?)</td>", row, re.S)
            values = [plain(cell) for cell in cells]
            href = unescape(re.search(r'href="([^"]+)"', cells[1]).group(1))
            rows.append({
                "profileId": values[0],
                "directoryTitle": values[1],
                "noc2021AsPublished": values[2],
                "broadCategoryAsPublished": values[3],
                "category": CATEGORIES[values[3]],
                "teerAsPublished": values[4],
                "sourceUrl": urljoin(DIRECTORY, href),
            })
        print(f"Directory page {page}/{pages}: {len(rows)}/{expected} profiles", flush=True)
        if page == pages:
            break
        form = FormInputs()
        form.feed(markup)
        form.fields["__EVENTTARGET"] = "ctl00$Main$OccupationDirectory$gridresults$ctl00$ctl03$ctl01$ctl04"
        form.fields["__EVENTARGUMENT"] = ""
        action = unescape(re.search(r'<form[^>]*action="([^"]+)"', markup).group(1))
        response = session.post(urljoin(response.url, action), data=form.fields, timeout=30)
    if len(rows) != expected or len({row["profileId"] for row in rows}) != expected:
        raise ValueError("Directory pagination is incomplete or contains duplicate profile IDs.")
    return rows


def profile_details(row):
    markup = get(row["sourceUrl"])
    statement = re.search(r'<div[^>]*id="[^"]*mainspecificstatement"[^>]*>(.*?)</div>', markup, re.S)
    words = plain(statement.group(1)).split() if statement else []
    table = re.search(r'<table class="occTable"[^>]*>(.*?)</table>', markup, re.S)
    jurisdictions = []
    if table:
        for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", table.group(1), re.S):
            cells = re.findall(r"<td[^>]*>(.*?)</td>", tr, re.S)
            if len(cells) != 5 or plain(cells[0]) not in JURISDICTIONS:
                continue
            flags = ["fa-check" in cell for cell in cells[1:]]
            jurisdictions.append({
                "jurisdiction": plain(cells[0]),
                "exclusivePractice": flags[0],
                "reservedTitle": flags[1],
                "voluntaryCertification": flags[2],
                "noCertification": flags[3],
                "classificationPresent": any(flags),
            })
    if len(jurisdictions) != 13:
        raise ValueError(f"Profile {row['profileId']} has {len(jurisdictions)} jurisdiction rows, expected 13.")
    regulated = [j for j in jurisdictions if j["exclusivePractice"] or j["reservedTitle"]]
    result = {
        **row,
        "sourceScopeExcerpt": " ".join(words[:150]),
        "sourceScopeExcerptTruncated": len(words) > 150,
        "jurisdictionsAsPublished": jurisdictions,
        "regulatedJurisdictionCountAsPublished": len(regulated),
        "requiresRoleScopeReview": True,
        "productionReady": False,
    }
    result["dataQualityFlags"] = quality_flags(result)
    return result


def quality_flags(row):
    statement = row["sourceScopeExcerpt"].lower()
    flags = []
    if "not regulated in canada" in statement or "normally not regulated" in statement:
        flags.append("Narrative describes unregulated work despite inclusion in the regulated search; resolve with current regulator.")
    if "adjustments are still" in statement:
        flags.append("Source explicitly says its regulatory content is still being adjusted.")
    if not statement:
        flags.append("No regulatory scope statement supplied.")
    if any(not j["classificationPresent"] for j in row["jurisdictionsAsPublished"]):
        flags.append("Source has unclassified jurisdiction cells; missing data is not an unregulated finding.")
    if row["profileId"] == "205":
        flags.append("Directory title Data scientists conflicts with engineering scope narrative; do not classify data scientists as regulated from this record.")
    if row["profileId"] == "85":
        flags.append("Directory title Physician assistants, midwives and allied health professionals conflicts with counselling scope narrative; split and verify actual roles.")
    return flags


def main():
    rows = collect_index()
    profiles = []
    failures = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {pool.submit(profile_details, row): row for row in rows}
        for future in as_completed(futures):
            row = futures[future]
            try:
                profiles.append(future.result())
            except Exception as error:
                failures.append({"profileId": row["profileId"], "sourceUrl": row["sourceUrl"], "error": str(error)})
            done = len(profiles) + len(failures)
            if done % 20 == 0 or done == len(rows):
                print(f"Profiles checked: {done}/{len(rows)}; failures: {len(failures)}", flush=True)
    profiles.sort(key=lambda row: (row["directoryTitle"].lower(), row["profileId"]))
    result = {
        "retrievedAtUtc": datetime.now(timezone.utc).isoformat(),
        "requestedScope": "All Canada, without a province selector",
        "source": "Canadian Information Centre for International Credentials (CICIC), Council of Ministers of Education, Canada",
        "sourceDirectory": DIRECTORY,
        "sourceSelection": "Regulated occupations: exclusive right to practise OR reserved title; all provinces and territories",
        "sourceReportedProfileCount": len(rows),
        "collectedProfileCount": len(profiles),
        "distinctPublishedNocCount": len({row["noc2021AsPublished"] for row in profiles}),
        "isExhaustiveLegalOccupationList": False,
        "productionReady": False,
        "limitations": [
            "A NOC group can include regulated and unregulated roles; never classify all group members or aliases as regulated.",
            "Published titles and NOC mappings can be inconsistent with the profile's regulatory narrative.",
            "Reserved-title protection does not necessarily require a licence for all related work.",
            "Voluntary certification is not mandatory occupational regulation.",
            "Directory search results may omit regulated occupations; check current government and statutory regulator sources.",
            "Absence from this snapshot cannot establish that a client's job is unregulated.",
        ],
        "profiles": profiles,
        "failures": failures,
    }
    destination = OUTPUT / "cicic-profiles.json"
    destination.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {len(profiles)} profiles to {destination}", flush=True)
    if failures:
        raise SystemExit("Some source pages could not be verified. See failures in the research JSON.")


if __name__ == "__main__":
    main()
