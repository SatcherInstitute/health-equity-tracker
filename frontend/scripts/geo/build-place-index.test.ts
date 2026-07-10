import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { describe, expect, test } from 'vitest'
import { COUNTY_FIPS_MAP } from '../../src/data/utils/FipsData'
import {
  buildPlaceIndex,
  cleanPlaceName,
  type PlaceEntry,
} from './build-place-index'

const __dir = dirname(fileURLToPath(import.meta.url))
const fileText = gunzipSync(
  readFileSync(resolve(__dir, 'national_place_by_county2020.txt.gz')),
).toString('utf8')
const index = buildPlaceIndex(fileText)

function find(name: string, statePostal: string): PlaceEntry | undefined {
  return index.places.find((p) => p[0] === name && p[1] === statePostal)
}

describe('cleanPlaceName', () => {
  test('strips LSAD descriptors', () => {
    expect(cleanPlaceName('Phoenix city')).toBe('Phoenix')
    expect(cleanPlaceName('Marbury CDP')).toBe('Marbury')
    expect(cleanPlaceName('Juneau city and borough')).toBe('Juneau')
    expect(cleanPlaceName('San Juan zona urbana')).toBe('San Juan')
    expect(cleanPlaceName('Kearns metro township')).toBe('Kearns')
    expect(
      cleanPlaceName('Cusseta-Chattahoochee County unified government'),
    ).toBe('Cusseta-Chattahoochee County')
  })

  test('keeps capitalized name words and unknown suffixes', () => {
    expect(cleanPlaceName('Carson City')).toBe('Carson City')
    expect(cleanPlaceName('Princeton')).toBe('Princeton')
    expect(cleanPlaceName('Copperton township')).toBe('Copperton township')
  })
})

describe('buildPlaceIndex', () => {
  test('rejects an unexpected header', () => {
    expect(() => buildPlaceIndex('WRONG|HEADER\n')).toThrow(/header/i)
  })

  test('groups multi-county places into one entry', () => {
    expect(find('Atlanta', 'GA')).toEqual(['Atlanta', 'GA', ['13089', '13121']])
    expect(find('New York', 'NY')?.[2]).toHaveLength(5)
  })

  test('drops places redundant with their county', () => {
    // Sarasota city sits in Sarasota County; the county option already wins.
    expect(find('Sarasota', 'FL')).toBeUndefined()
    // San Juan zona urbana duplicates San Juan Municipio.
    expect(find('San Juan', 'PR')).toBeUndefined()
    // Carson City is its own county equivalent.
    expect(find('Carson City', 'NV')).toBeUndefined()
  })

  test('every county code resolves in the app county map', () => {
    for (const [, , counties] of index.places) {
      for (const countyFips of counties) {
        expect(COUNTY_FIPS_MAP[countyFips]).toBeDefined()
      }
    }
  })

  test('output is deterministic and versioned', () => {
    expect(index.v).toBe(1)
    expect(index.places.length).toBeGreaterThan(30000)
    const rebuilt = buildPlaceIndex(fileText)
    expect(JSON.stringify(rebuilt)).toBe(JSON.stringify(index))
  })
})
