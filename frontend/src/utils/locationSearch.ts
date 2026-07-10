/* cSpell:ignore salle */
import uFuzzy from '@leeoniya/ufuzzy'
import type { Fips } from '../data/utils/Fips'

export const STATE_POSTAL_ALIASES: Record<string, string> = {
  /* cSpell:disable */
  al: 'alabama',
  ak: 'alaska',
  az: 'arizona',
  ar: 'arkansas',
  ca: 'california',
  co: 'colorado',
  ct: 'connecticut',
  de: 'delaware',
  fl: 'florida',
  ga: 'georgia',
  hi: 'hawaii',
  id: 'idaho',
  il: 'illinois',
  in: 'indiana',
  ia: 'iowa',
  ks: 'kansas',
  ky: 'kentucky',
  la: 'louisiana',
  me: 'maine',
  md: 'maryland',
  ma: 'massachusetts',
  mi: 'michigan',
  mn: 'minnesota',
  ms: 'mississippi',
  mo: 'missouri',
  mt: 'montana',
  ne: 'nebraska',
  nv: 'nevada',
  nh: 'new hampshire',
  nj: 'new jersey',
  nm: 'new mexico',
  ny: 'new york',
  nc: 'north carolina',
  nd: 'north dakota',
  oh: 'ohio',
  ok: 'oklahoma',
  or: 'oregon',
  pa: 'pennsylvania',
  ri: 'rhode island',
  sc: 'south carolina',
  sd: 'south dakota',
  tn: 'tennessee',
  tx: 'texas',
  ut: 'utah',
  vt: 'vermont',
  va: 'virginia',
  wa: 'washington',
  wv: 'west virginia',
  wi: 'wisconsin',
  wy: 'wyoming',
  dc: 'district of columbia',
  pr: 'puerto rico',
  gu: 'guam',
  as: 'american samoa',
  mp: 'northern mariana islands',
  vi: 'us virgin islands',
  /* cSpell:enable */
}

export const SEARCH_ALIASES: Record<string, string> = {
  // State and territory postal abbreviations
  ...STATE_POSTAL_ALIASES,
  // Abbreviation-style shorthand
  st: 'saint',
  us: 'united states',
  usa: 'united states',
  usvi: 'us virgin islands',
}

export function normalizeText(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[.,'’]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// "st" is expanded on both sides (haystack build and query aliases) so
// "St. John", "Saint John", and "st john" all land on the same tokens.
export function canonicalizeTokens(normalized: string): string {
  return normalized
    .split(' ')
    .map((token) => (token === 'st' ? 'saint' : token))
    .join(' ')
}

export function expandQuery(normalized: string): string[] {
  const aliased = normalized
    .split(' ')
    .map((token) => SEARCH_ALIASES[token] ?? token)
    .join(' ')
  // Aliases only ever add a second needle, never replace the raw one, so
  // "in" still matches Indiana and "la salle" still matches LaSalle Parish.
  return aliased === normalized ? [normalized] : [normalized, aliased]
}

const CORE_NAME_SUFFIX =
  /\s+(county|parish|borough|census area|municipality|municipio|city and borough|city)$/

interface FipsSearchEntry {
  haystack: string
  coreName: string
  group: string
  index: number
}

export interface FipsSearchIndex {
  entries: FipsSearchEntry[]
  haystacks: string[]
}

const indexCache = new WeakMap<Fips[], FipsSearchIndex>()

export function buildFipsSearchIndex(options: Fips[]): FipsSearchIndex {
  const cached = indexCache.get(options)
  if (cached) return cached

  const entries = options.map((fips, index) => {
    const fullName = canonicalizeTokens(
      normalizeText(fips.getFullDisplayName()),
    )
    const stateName = canonicalizeTokens(
      normalizeText(fips.getStateDisplayName()),
    )
    const haystack = fullName.includes(stateName)
      ? fullName
      : `${fullName} ${stateName}`
    const coreName = canonicalizeTokens(
      normalizeText(fips.getDisplayName()),
    ).replace(CORE_NAME_SUFFIX, '')
    return { haystack, coreName, group: fips.getFipsCategory(), index }
  })

  const index: FipsSearchIndex = {
    entries,
    haystacks: entries.map((entry) => entry.haystack),
  }
  indexCache.set(options, index)
  return index
}

const uf = new uFuzzy({
  intraMode: 1,
  intraIns: 1,
  intraSub: 1,
  intraTrn: 1,
  intraDel: 1,
})

// Keep ranked results even for very short queries that match most options.
const INFO_THRESHOLD = 5000

export function filterAndRankFips(
  options: Fips[],
  index: FipsSearchIndex,
  input: string,
): Fips[] {
  const normalized = normalizeText(input)
  if (normalized === '') return options

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
    const rankedIdxs = order ? order.map((infoIdx) => info.idx[infoIdx]) : idxs
    rankedIdxs.forEach((haystackIdx, rank) => {
      const previous = bestRank.get(haystackIdx)
      if (previous === undefined || rank < previous) {
        bestRank.set(haystackIdx, rank)
      }
    })
  }
  if (bestRank.size === 0) return []

  // Boost tiers on top of uFuzzy's ranking: exact core-name match first,
  // then prefix matches, then uFuzzy order.
  const matched: { entry: FipsSearchEntry; score: number }[] = []
  for (const [haystackIdx, rank] of bestRank) {
    const entry = index.entries[haystackIdx]
    let tier = 2
    for (const needle of needles) {
      if (entry.coreName === needle || entry.haystack === needle) {
        tier = 0
        break
      }
      if (
        entry.coreName.startsWith(needle) ||
        entry.haystack.startsWith(needle)
      ) {
        tier = 1
      }
    }
    matched.push({ entry, score: tier * 1_000_000 + rank })
  }

  // MUI groupBy requires each group to be contiguous in the filtered result,
  // so sort whole groups by their best score before sorting within groups.
  const groupBestScore = new Map<string, number>()
  const groupFirstIndex = new Map<string, number>()
  for (const { entry, score } of matched) {
    const currentBest = groupBestScore.get(entry.group)
    if (currentBest === undefined || score < currentBest) {
      groupBestScore.set(entry.group, score)
    }
    const currentFirst = groupFirstIndex.get(entry.group)
    if (currentFirst === undefined || entry.index < currentFirst) {
      groupFirstIndex.set(entry.group, entry.index)
    }
  }

  matched.sort((a, b) => {
    if (a.entry.group !== b.entry.group) {
      return (
        (groupBestScore.get(a.entry.group) ?? 0) -
          (groupBestScore.get(b.entry.group) ?? 0) ||
        (groupFirstIndex.get(a.entry.group) ?? 0) -
          (groupFirstIndex.get(b.entry.group) ?? 0)
      )
    }
    return a.score - b.score || a.entry.index - b.entry.index
  })

  return matched.map(({ entry }) => options[entry.index])
}
