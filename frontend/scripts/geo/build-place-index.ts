#!/usr/bin/env tsx
// Regenerates the committed city/place search index
// (src/assets/geo/place-index.json) from the 2020 Census national
// place-by-county relationship file, downloaded from census.gov:
//
//   npm run places:refresh
//
// Each place row maps a Census place (incorporated place or CDP) to the
// county (or counties) containing it, letting the location search offer
// "Atlanta, GA (Fulton County)" style options that navigate to the county.
//
// The header row is asserted so Census format drift fails loudly instead of
// producing a wrong index. The unit tests also assert the committed index
// stays consistent with the app's county map, so a COUNTY_FIPS_MAP change
// that invalidates the index fails CI until this script is re-run.

import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { COUNTY_FIPS_MAP } from '../../src/data/utils/FipsData'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT_FILE = resolve(__dir, '../../src/assets/geo/place-index.json')
const CENSUS_URL =
  'https://www2.census.gov/geo/docs/reference/codes2020/national_place_by_county2020.txt'

const EXPECTED_HEADER =
  'STATE|STATEFP|COUNTYFP|COUNTYNAME|PLACEFP|PLACENS|PLACENAME|TYPE|CLASSFP|FUNCSTAT'

// A = active incorporated place, S = statistical entity (CDP). Everything
// else (inactive, fictitious "balance" records, etc.) is skipped.
const KEPT_FUNCSTAT = new Set(['A', 'S'])

// Census LSAD descriptors appended to PLACENAME, longest first so compound
// suffixes strip before their substrings. Lowercase-sensitive on purpose:
// "Carson City" keeps its name while "Phoenix city" sheds the descriptor.
// Unknown suffixes pass through untouched (bad label, never wrong navigation).
const PLACE_NAME_SUFFIXES = [
  ' consolidated government',
  ' metropolitan government',
  ' unified government',
  ' city and borough',
  ' metro township',
  ' urban county',
  ' zona urbana',
  ' municipality',
  ' comunidad',
  ' corporation',
  ' borough',
  ' village',
  ' city',
  ' town',
  ' CDP',
]

export function cleanPlaceName(placeName: string): string {
  for (const suffix of PLACE_NAME_SUFFIXES) {
    if (placeName.endsWith(suffix)) {
      return placeName.slice(0, -suffix.length)
    }
  }
  return placeName
}

// [cleaned name, state postal, county fips codes]
export type PlaceEntry = [string, string, string[]]

export interface PlaceIndexFile {
  v: 1
  places: PlaceEntry[]
}

export function buildPlaceIndex(fileText: string): PlaceIndexFile {
  const lines = fileText.split('\n')
  if (lines[0].trim() !== EXPECTED_HEADER) {
    throw new Error(
      `Unexpected header in place file; Census format may have drifted.\n  expected: ${EXPECTED_HEADER}\n  received: ${lines[0].trim()}`,
    )
  }

  // One place can span several counties (one row per county); group rows by
  // state + Census place code so each place becomes a single entry.
  const byPlace = new Map<string, { name: string; counties: string[] }>()
  for (const line of lines.slice(1)) {
    if (line.trim() === '') continue
    const [statePostal, stateFp, countyFp, , placeFp, , placeName, , , funcstat] =
      line.split('|')
    if (!KEPT_FUNCSTAT.has(funcstat?.trim())) continue
    const countyFips = `${stateFp}${countyFp}`
    // Counties absent from the app's map (e.g. boundary changes newer than
    // our county list) cannot be navigated to, so skip those rows.
    if (!(countyFips in COUNTY_FIPS_MAP)) continue

    const key = `${statePostal}|${placeFp}`
    const existing = byPlace.get(key)
    if (existing) {
      existing.counties.push(countyFips)
    } else {
      byPlace.set(key, {
        name: `${statePostal}|${cleanPlaceName(placeName)}`,
        counties: [countyFips],
      })
    }
  }

  const places: PlaceEntry[] = []
  for (const { name, counties } of byPlace.values()) {
    const [statePostal, cleanedName] = [
      name.slice(0, name.indexOf('|')),
      name.slice(name.indexOf('|') + 1),
    ]
    // A place named exactly like its sole county (e.g. Sarasota city in
    // Sarasota County) is redundant: the county option already covers it.
    if (
      counties.length === 1 &&
      cleanedName.toLowerCase() ===
        COUNTY_FIPS_MAP[counties[0]].toLowerCase()
    ) {
      continue
    }
    places.push([cleanedName, statePostal, counties.sort()])
  }

  // Deterministic output order keeps rebuilds byte-identical.
  places.sort(
    (a, b) => a[1].localeCompare(b[1]) || a[0].localeCompare(b[0]),
  )
  return { v: 1, places }
}

async function main(): Promise<void> {
  const response = await fetch(CENSUS_URL)
  if (!response.ok) {
    throw new Error(`Census download failed: ${response.status} ${CENSUS_URL}`)
  }
  const index = buildPlaceIndex(await response.text())
  await writeFile(OUT_FILE, JSON.stringify(index))
  console.log(
    `✔  place index refreshed → ${index.places.length} places in src/assets/geo/place-index.json`,
  )
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main()
}
