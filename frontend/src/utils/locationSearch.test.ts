// Intentional misspellings and stripped variants under test; keep them out
// of the shared dictionary so real typos elsewhere still get caught.
/* cSpell:ignore anasco, sarsota, salle */
import { describe, expect, it } from 'vitest'
import { Fips } from '../data/utils/Fips'
import { COUNTY_FIPS_MAP, STATE_FIPS_MAP } from '../data/utils/FipsData'
import {
  buildFipsSearchIndex,
  expandQuery,
  filterAndRankFips,
  normalizeText,
} from './locationSearch'

// Mirrors the sort in LocationSelector.tsx so groups are contiguous.
function buildOptions(): Fips[] {
  const codes = [
    ...Object.keys(STATE_FIPS_MAP),
    ...Object.keys(COUNTY_FIPS_MAP),
  ]
  const groupSortKey = (fips: Fips): string => {
    if (fips.isUsa()) return '0'
    if (fips.isState()) return '1'
    if (fips.isTerritory()) return '2'
    return `3_${fips.getFipsCategory()}`
  }
  return codes
    .map((code) => new Fips(code))
    .sort((a, b) => {
      const ka = groupSortKey(a)
      const kb = groupSortKey(b)
      if (ka !== kb) return ka.localeCompare(kb)
      return a.code.localeCompare(b.code)
    })
}

const options = buildOptions()
const index = buildFipsSearchIndex(options)

function search(query: string): Fips[] {
  return filterAndRankFips(options, index, query)
}

function names(query: string): string[] {
  return search(query).map((fips) => fips.getFullDisplayName())
}

describe('normalizeText', () => {
  it('strips diacritics, punctuation, and extra whitespace', () => {
    expect(normalizeText('Añasco')).toBe('anasco')
    expect(normalizeText("St. John's   Parish")).toBe('st johns parish')
    expect(normalizeText('  Doña Ana ')).toBe('dona ana')
  })
})

describe('expandQuery', () => {
  it('returns one needle when no alias applies', () => {
    expect(expandQuery('sarasota')).toEqual(['sarasota'])
  })

  it('adds an alias-expanded needle without dropping the raw one', () => {
    expect(expandQuery('sarasota fl')).toEqual([
      'sarasota fl',
      'sarasota florida',
    ])
  })
})

describe('filterAndRankFips', () => {
  it('returns the original list for an empty query', () => {
    expect(search('')).toEqual(options)
    expect(search('   ')).toEqual(options)
  })

  it('matches with diacritics stripped in either direction', () => {
    expect(names('Añasco')[0]).toContain('Añasco')
    expect(names('anasco')[0]).toContain('Añasco')
  })

  it('treats St. and Saint as equivalent', () => {
    const stJohn = 'St. John the Baptist Parish, Louisiana'
    expect(names('Saint John')).toContain(stJohn)
    expect(names('St. John')).toContain(stJohn)
    expect(names('st john')).toContain(stJohn)
  })

  it('ranks District of Columbia first for "DC"', () => {
    expect(names('DC')[0]).toBe('District of Columbia')
  })

  it('ranks the United States first for "us" and "usa"', () => {
    expect(names('us')[0]).toBe('United States')
    expect(names('usa')[0]).toBe('United States')
  })

  it('ranks Sarasota County first for "sarasota fl"', () => {
    expect(names('sarasota fl')[0]).toBe('Sarasota County, Florida')
  })

  it('matches both "sarasota" and "sarasota county"', () => {
    expect(names('sarasota')[0]).toBe('Sarasota County, Florida')
    expect(names('sarasota county')[0]).toBe('Sarasota County, Florida')
  })

  it('is order-insensitive across name and state terms', () => {
    expect(names('florida sarasota')[0]).toBe('Sarasota County, Florida')
  })

  it('tolerates a single-character typo', () => {
    expect(names('sarsota')).toContain('Sarasota County, Florida')
  })

  it('does not let the "in" alias clobber Indiana matches', () => {
    expect(names('in')).toContain('Indiana')
  })

  it('does not let the "la" alias clobber LaSalle matches', () => {
    expect(names('la salle')).toContain('LaSalle Parish, Louisiana')
  })

  it('does not let the "or" alias clobber Oregon-prefix matches', () => {
    expect(names('or')).toContain('Oregon')
  })

  it('keeps groups contiguous for MUI groupBy', () => {
    for (const query of ['sarasota', 'new', 'washington', 'st', 'a']) {
      const groups = search(query).map((fips) => fips.getFipsCategory())
      const seen = new Set<string>()
      let previous: string | undefined
      for (const group of groups) {
        if (group !== previous) {
          expect(seen.has(group)).toBe(false)
          seen.add(group)
          previous = group
        }
      }
    }
  })
})
