import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { COUNTY_FIPS_MAP } from '../../src/data/utils/FipsData'
import {
  buildPlaceIndex,
  cleanPlaceName,
  type PlaceIndexFile,
} from './build-place-index'

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

const HEADER =
  'STATE|STATEFP|COUNTYFP|COUNTYNAME|PLACEFP|PLACENS|PLACENAME|TYPE|CLASSFP|FUNCSTAT'

const FIXTURE = [
  HEADER,
  'GA|13|089|DeKalb County|04000|02403126|Atlanta city|INCORPORATED PLACE|C1|A',
  'GA|13|121|Fulton County|04000|02403126|Atlanta city|INCORPORATED PLACE|C1|A',
  'FL|12|115|Sarasota County|64175|02405656|Sarasota city|INCORPORATED PLACE|C1|A',
  'PR|72|127|San Juan Municipio|76770|02414740|San Juan zona urbana|ZONA URBANA|U1|S',
  'NV|32|510|Carson City|09700|00845063|Carson City|INCORPORATED PLACE|C1|A',
  'AZ|04|013|Maricopa County|55000|02411414|Phoenix city|INCORPORATED PLACE|C1|F',
  'GA|13|999|Nowhere County|11111|11111111|Testville town|INCORPORATED PLACE|C1|A',
  '',
].join('\n')

describe('buildPlaceIndex', () => {
  const index = buildPlaceIndex(FIXTURE)

  test('rejects an unexpected header', () => {
    expect(() => buildPlaceIndex('WRONG|HEADER\n')).toThrow(/header/i)
  })

  test('groups multi-county places into one entry', () => {
    expect(index.places).toContainEqual(['Atlanta', 'GA', ['13089', '13121']])
  })

  test('drops places redundant with their county', () => {
    const names = index.places.map(([name]) => name)
    // Sarasota city sits in Sarasota County; the county option already wins.
    expect(names).not.toContain('Sarasota')
    // San Juan zona urbana duplicates San Juan Municipio.
    expect(names).not.toContain('San Juan')
    // Carson City is its own county equivalent.
    expect(names).not.toContain('Carson City')
  })

  test('drops inactive places and unknown counties', () => {
    const names = index.places.map(([name]) => name)
    // Phoenix row has FUNCSTAT F (fictitious/inactive).
    expect(names).not.toContain('Phoenix')
    // Testville sits in county 13999, absent from COUNTY_FIPS_MAP.
    expect(names).not.toContain('Testville')
  })

  test('output is deterministic', () => {
    expect(index.v).toBe(1)
    expect(JSON.stringify(buildPlaceIndex(FIXTURE))).toBe(
      JSON.stringify(index),
    )
  })
})

// Drift guard: the committed index must stay consistent with the app's
// county map. If COUNTY_FIPS_MAP changes in a way that invalidates it,
// this fails until `npm run places:refresh` is re-run.
describe('committed place-index.json', () => {
  const __dir = dirname(fileURLToPath(import.meta.url))
  const committed: PlaceIndexFile = JSON.parse(
    readFileSync(resolve(__dir, '../../src/assets/geo/place-index.json'), 'utf8'),
  )

  test('is versioned and complete', () => {
    expect(committed.v).toBe(1)
    expect(committed.places.length).toBeGreaterThan(30000)
  })

  test('every county code resolves in the app county map', () => {
    for (const [, , counties] of committed.places) {
      for (const countyFips of counties) {
        expect(COUNTY_FIPS_MAP[countyFips]).toBeDefined()
      }
    }
  })
})
