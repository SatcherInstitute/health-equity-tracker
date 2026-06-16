#!/usr/bin/env python3
"""
Refresh all locally-cached CAWP source data files.

Run from repo root when CAWP data needs updating:

    python data/cawp/refresh_cawp_data.py [--force] [--section SECTION]

Options:
    --force           Bypass the 30-day freshness cache and re-download everything
    --section NAME    Only run one section: state_leg | congress_json | crosswalk

Cache: each section records its last-run timestamp in .refresh_cache.json.
By default the script skips any section that ran successfully within the last 30 days.
Individual failed states are retried on the next run even within the cache window.

What this updates:
  - data/cawp/cawp_state_leg_{fips}.csv  50 state + 6 territory leg denominator tables
  - data/cawp/legislators-historical.json  US Congress historical (unitedstates.io)
  - data/cawp/legislators-current.json     US Congress current (unitedstates.io)
  - data/cawp/tab20_cd11820_county20_natl.txt  118th Congress county crosswalk (Census)

What this does NOT update automatically:
  - cawp-by_race_and_ethnicity_time_series.csv  (requires manual login at cawpdata.rutgers.edu)
    See download instructions at the top of python/datasources/cawp.py

Requirements (install once):
    pip install playwright playwright-stealth requests pandas lxml html5lib beautifulsoup4
    playwright install chromium

After running, commit changed files and re-run the relevant DAG pipelines.
"""

import argparse
import json
import sys
import time
from datetime import datetime, timedelta
from io import StringIO
from pathlib import Path

import pandas as pd
import requests

DATA_DIR = Path(__file__).parent
CACHE_FILE = DATA_DIR / ".refresh_cache.json"
CACHE_TTL_DAYS = 30
CRAWL_DELAY_SECONDS = 2  # polite delay between CAWP page requests

# --- URLs ---
CONGRESS_HISTORICAL_URL = "https://unitedstates.github.io/congress-legislators/legislators-historical.json"
CONGRESS_CURRENT_URL = "https://unitedstates.github.io/congress-legislators/legislators-current.json"
CROSSWALK_URL = "https://www2.census.gov/geo/docs/maps-data/data/rel2020/cd-sld/tab20_cd11820_county20_natl.txt"
CAWP_STATE_INFO_URL = "https://cawp.rutgers.edu/facts/state-state-information/{slug}"

STLEG_TOTAL_COL = "Total Women/Total Legislature"  # column that identifies the denominator table

# FIPS -> state info page slug (50 states only; territories are handled separately)
FIPS_TO_STATE_SLUG = {
    "01": "alabama",
    "02": "alaska",
    "04": "arizona",
    "05": "arkansas",
    "06": "california",
    "08": "colorado",
    "09": "connecticut",
    "10": "delaware",
    "12": "florida",
    "13": "georgia",
    "15": "hawaii",
    "16": "idaho",
    "17": "illinois",
    "18": "indiana",
    "19": "iowa",
    "20": "kansas",
    "21": "kentucky",
    "22": "louisiana",
    "23": "maine",
    "24": "maryland",
    "25": "massachusetts",
    "26": "michigan",
    "27": "minnesota",
    "28": "mississippi",
    "29": "missouri",
    "30": "montana",
    "31": "nebraska",
    "32": "nevada",
    "33": "new-hampshire",
    "34": "new-jersey",
    "35": "new-mexico",
    "36": "new-york",
    "37": "north-carolina",
    "38": "north-dakota",
    "39": "ohio",
    "40": "oklahoma",
    "41": "oregon",
    "42": "pennsylvania",
    "44": "rhode-island",
    "45": "south-carolina",
    "46": "south-dakota",
    "47": "tennessee",
    "48": "texas",
    "49": "utah",
    "50": "vermont",
    "51": "virginia",
    "53": "washington",
    "54": "west-virginia",
    "55": "wisconsin",
    "56": "wyoming",
}

# Territories: already maintained as manual CSV files; included in the cache
# so we know when they were last reviewed, but the script does not overwrite them.
TERRITORY_FIPS = ["11", "60", "66", "69", "72", "78"]


# ---------------------------------------------------------------------------
# Cache helpers
# ---------------------------------------------------------------------------


def load_cache() -> dict:
    if CACHE_FILE.exists():
        return json.loads(CACHE_FILE.read_text())
    return {}


def save_cache(cache: dict):
    CACHE_FILE.write_text(json.dumps(cache, indent=2, default=str))


def is_fresh(cache: dict, key: str, ttl_days: int = CACHE_TTL_DAYS) -> bool:
    entry = cache.get(key)
    if not entry:
        return False
    last_run = datetime.fromisoformat(entry["last_run"])
    return datetime.now() - last_run < timedelta(days=ttl_days)


def mark_done(cache: dict, key: str):
    if key not in cache:
        cache[key] = {}
    cache[key]["last_run"] = datetime.now().isoformat()
    save_cache(cache)


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------


def fetch_if_changed(url: str, dest: Path, cache: dict, cache_key: str) -> bool:
    """Download url to dest, skipping if ETag/Last-Modified says unchanged.
    Returns True if file was updated."""
    headers = {}
    cached = cache.get(cache_key, {})
    if dest.exists():
        if cached.get("etag"):
            headers["If-None-Match"] = cached["etag"]
        elif cached.get("last_modified"):
            headers["If-Modified-Since"] = cached["last_modified"]

    r = requests.get(url, headers=headers, timeout=60)

    if r.status_code == 304:
        print(f"  Unchanged (304) - skipping {dest.name}")
        return False

    r.raise_for_status()
    dest.write_bytes(r.content)

    # persist ETag / Last-Modified for next run
    cache[cache_key] = {
        "last_run": datetime.now().isoformat(),
        "etag": r.headers.get("ETag"),
        "last_modified": r.headers.get("Last-Modified"),
    }
    save_cache(cache)
    return True


# ---------------------------------------------------------------------------
# Section: Congress JSON
# ---------------------------------------------------------------------------


def refresh_congress_json(cache: dict, force: bool):
    print("\n--- US Congress JSON (unitedstates.io) ---")
    sources = [
        ("legislators-historical.json", CONGRESS_HISTORICAL_URL),
        ("legislators-current.json", CONGRESS_CURRENT_URL),
    ]
    for name, url in sources:
        key = f"congress_json_{name}"
        if not force and is_fresh(cache, key):
            last = cache[key]["last_run"][:10]
            print(f"  {name}: fresh (last run {last}), skipping")
            continue
        dest = DATA_DIR / name
        print(f"  Downloading {name}...", end=" ", flush=True)
        updated = fetch_if_changed(url, dest, cache, key)
        if updated:
            count = len(json.loads(dest.read_text()))
            print(f"{count} records saved.")
        mark_done(cache, key)


# ---------------------------------------------------------------------------
# Section: County crosswalk
# ---------------------------------------------------------------------------


def refresh_crosswalk(cache: dict, force: bool):
    print("\n--- Census county-to-congressional-district crosswalk ---")
    key = "crosswalk"
    if not force and is_fresh(cache, key):
        last = cache[key]["last_run"][:10]
        print(f"  Fresh (last run {last}), skipping")
        return
    dest = DATA_DIR / "tab20_cd11820_county20_natl.txt"
    print("  Downloading crosswalk...", end=" ", flush=True)
    updated = fetch_if_changed(CROSSWALK_URL, dest, cache, key)
    if updated:
        lines = dest.read_text().count("\n")
        print(f"{lines} lines saved.")
    mark_done(cache, key)


# ---------------------------------------------------------------------------
# Section: State leg denominator tables (50 states via Playwright)
# ---------------------------------------------------------------------------


def _scrape_state(browser, stealth, fips: str, slug: str) -> pd.DataFrame:
    """Open a fresh browser context, scrape the state info page, return cleaned df."""
    context = browser.new_context(
        user_agent=(
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
        )
    )
    stealth.apply_stealth_sync(context)
    page = context.new_page()
    try:
        url = CAWP_STATE_INFO_URL.format(slug=slug)
        page.goto(url, wait_until="load", timeout=30000)
        page.wait_for_timeout(1500)

        if "Just a moment" in page.content():
            raise RuntimeError("Cloudflare challenge not resolved")

        tables = pd.read_html(StringIO(page.content()))
        matches = [t for t in tables if STLEG_TOTAL_COL in t.columns]
        if not matches:
            raise ValueError(f"No table with '{STLEG_TOTAL_COL}' column found ({len(tables)} tables on page)")

        df = matches[0]
        df["total_state_leg_count"] = (
            df[STLEG_TOTAL_COL].str.split("/", n=1).str[1].str.extract(r"(\d+)", expand=False).astype("Int64")
        )
        df = df.rename(columns={"Year": "time_period"})
        df["state_fips"] = fips
        df = df[["time_period", "state_fips", "total_state_leg_count"]].dropna(subset=["time_period"])
        df["time_period"] = df["time_period"].astype(str).str.strip()
        return df
    finally:
        context.close()


def refresh_state_leg_tables(cache: dict, force: bool):
    print("\n--- CAWP state legislature denominator tables (50 states via Playwright) ---")

    # determine which states need scraping
    states_to_scrape = {}
    for fips, slug in FIPS_TO_STATE_SLUG.items():
        key = f"state_leg_{fips}"
        out_path = DATA_DIR / f"cawp_state_leg_{fips}.csv"
        if not force and is_fresh(cache, key) and out_path.exists():
            continue
        states_to_scrape[fips] = slug

    if not states_to_scrape:
        last_dates = [cache[f"state_leg_{f}"]["last_run"][:10] for f in FIPS_TO_STATE_SLUG if f"state_leg_{f}" in cache]
        oldest = min(last_dates) if last_dates else "unknown"
        print(f"  All 50 states fresh (oldest: {oldest}), skipping")
        return

    print(f"  Scraping {len(states_to_scrape)}/50 states...")

    try:
        from playwright.sync_api import sync_playwright  # pylint: disable=import-outside-toplevel
        from playwright_stealth import Stealth  # pylint: disable=import-outside-toplevel
    except ImportError:
        print("  ERROR: playwright and playwright-stealth are required.")
        print("    pip install playwright playwright-stealth && playwright install chromium")
        sys.exit(1)

    errors = []
    with sync_playwright() as p:
        stealth = Stealth(navigator_webdriver=False)
        browser = p.chromium.launch(headless=True)

        total = len(states_to_scrape)
        for i, (fips, slug) in enumerate(states_to_scrape.items(), 1):
            out_path = DATA_DIR / f"cawp_state_leg_{fips}.csv"
            try:
                df = _scrape_state(browser, stealth, fips, slug)
                df.to_csv(out_path, index=False)
                mark_done(cache, f"state_leg_{fips}")
                print(f"  [{i:2d}/{total}] {slug:<22} {len(df)} rows")
            except Exception as e:
                print(f"  [{i:2d}/{total}] {slug:<22} FAILED: {e}")
                errors.append((fips, slug, str(e)))

            if i < total:
                time.sleep(CRAWL_DELAY_SECONDS)

        browser.close()

    if errors:
        print(f"\n  {len(errors)} states failed (will retry on next run):")
        for fips, slug, err in errors:
            print(f"    {fips} {slug}: {err}")
    else:
        print(f"\n  All {total} states saved successfully.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main():
    parser = argparse.ArgumentParser(description="Refresh CAWP source data files")
    parser.add_argument("--force", action="store_true", help="Ignore cache and re-download everything")
    parser.add_argument("--section", choices=["state_leg", "congress_json", "crosswalk"], help="Run only one section")
    args = parser.parse_args()

    print(f"CAWP data refresh  |  cache TTL: {CACHE_TTL_DAYS} days  |  force: {args.force}")
    print(f"Output directory: {DATA_DIR}\n")

    cache = load_cache()

    run_all = args.section is None
    if run_all or args.section == "congress_json":
        refresh_congress_json(cache, args.force)
    if run_all or args.section == "crosswalk":
        refresh_crosswalk(cache, args.force)
    if run_all or args.section == "state_leg":
        refresh_state_leg_tables(cache, args.force)

    print("\nDone. Review changes with: git diff data/cawp/")
    print("Then commit and re-run the relevant DAG pipelines.")


if __name__ == "__main__":
    main()
