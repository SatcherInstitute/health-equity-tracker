import uFuzzy from '@leeoniya/ufuzzy'
import { Fips } from '../data/utils/Fips'
import {
  canonicalizeTokens,
  expandQuery,
  normalizeText,
  STATE_POSTAL_ALIASES,
} from './locationSearch'

// The place index is a committed asset (regenerate via npm run
// places:refresh, see scripts/geo/build-place-index.ts), served
// fingerprinted from /assets/ and only fetched once the user opens the
// location search.
const placeIndexUrls = import.meta.glob<string>(
  '../assets/geo/place-index.json',
  {
    query: '?url',
    import: 'default',
    eager: true,
  },
)

// A city or Census-designated place; selecting it navigates to the county
// (or one of the counties) containing it.
export interface CityOption {
  kind: 'city'
  id: string
  label: string
  countyFips: string
}

export type LocationOption = Fips | CityOption

export function locationOptionKey(option: LocationOption): string {
  return option instanceof Fips ? option.code : option.id
}

export function locationOptionLabel(option: LocationOption): string {
  return option instanceof Fips ? option.getFullDisplayName() : option.label
}

// Mirrors PlaceIndexFile in scripts/geo/build-place-index.ts:
// [cleaned name, state postal, county fips codes]
type PlaceEntry = [string, string, string[]]

interface PlaceIndexFile {
  v: 1
  places: PlaceEntry[]
}

interface PlaceSearchEntry {
  option: CityOption
  coreName: string
}

export interface PlaceSearchIndex {
  entries: PlaceSearchEntry[]
  haystacks: string[]
}

export function buildPlaceSearchIndex(file: PlaceIndexFile): PlaceSearchIndex {
  const entries: PlaceSearchEntry[] = []
  const haystacks: string[] = []
  for (const [name, statePostal, counties] of file.places) {
    const coreName = canonicalizeTokens(normalizeText(name))
    const postal = statePostal.toLowerCase()
    const stateName = STATE_POSTAL_ALIASES[postal] ?? ''
    const haystack = `${coreName} ${postal} ${stateName}`.trim()
    // Multi-county places become one selectable option per county.
    for (const countyFips of counties) {
      entries.push({
        option: {
          kind: 'city',
          id: `${name}|${statePostal}|${countyFips}`,
          label: `${name}, ${statePostal} → ${new Fips(countyFips).getDisplayName()}`,
          countyFips,
        },
        coreName,
      })
      haystacks.push(haystack)
    }
  }
  return { entries, haystacks }
}

let placeIndexPromise: Promise<PlaceSearchIndex> | null = null

export function loadPlaceIndex(): Promise<PlaceSearchIndex> {
  if (!placeIndexPromise) {
    const url = placeIndexUrls['../assets/geo/place-index.json']
    placeIndexPromise = fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Place index fetch failed: ${response.status}`)
        }
        return response.json() as Promise<PlaceIndexFile>
      })
      .then(buildPlaceSearchIndex)
    // Clear the memo on failure so a later open can retry the fetch.
    placeIndexPromise.catch(() => {
      placeIndexPromise = null
    })
  }
  return placeIndexPromise
}

const uf = new uFuzzy({
  intraMode: 1,
  intraIns: 1,
  intraSub: 1,
  intraTrn: 1,
  intraDel: 1,
})

const INFO_THRESHOLD = 5000
const MIN_QUERY_LENGTH = 2

export function searchPlaces(
  index: PlaceSearchIndex,
  input: string,
  limit = 10,
): CityOption[] {
  const normalized = normalizeText(input)
  if (normalized.length < MIN_QUERY_LENGTH) return []

  const needles = expandQuery(normalized)
  const bestRank = new Map<number, number>()
  for (const needle of needles) {
    const [idxs, info, order] = uf.search(
      index.haystacks,
      needle,
      1,
      INFO_THRESHOLD,
    )
    if (!idxs) continue
    const rankedIdxs =
      order && info ? order.map((infoIdx) => info.idx[infoIdx]) : idxs
    rankedIdxs.forEach((haystackIdx, rank) => {
      const previous = bestRank.get(haystackIdx)
      if (previous === undefined || rank < previous) {
        bestRank.set(haystackIdx, rank)
      }
    })
  }
  if (bestRank.size === 0) return []

  // Same tier boosts as filterAndRankFips: exact name, then prefix, then
  // uFuzzy's own ranking.
  const matched: { entry: PlaceSearchEntry; score: number }[] = []
  for (const [haystackIdx, rank] of bestRank) {
    const entry = index.entries[haystackIdx]
    let tier = 2
    for (const needle of needles) {
      if (entry.coreName === needle) {
        tier = 0
        break
      }
      if (entry.coreName.startsWith(needle)) {
        tier = 1
      }
    }
    matched.push({ entry, score: tier * 1_000_000 + rank })
  }

  matched.sort(
    (a, b) =>
      a.score - b.score ||
      a.entry.option.label.localeCompare(b.entry.option.label),
  )
  return matched.slice(0, limit).map(({ entry }) => entry.option)
}
