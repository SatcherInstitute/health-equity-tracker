// atalanta is an intentional misspelling under test; marys is the real
// Census place name St. Marys.
/* cSpell:ignore atalanta, marys */
import { describe, expect, test } from 'vitest'
import { buildPlaceSearchIndex, searchPlaces } from './placeSearch'

const index = buildPlaceSearchIndex({
  v: 1,
  places: [
    ['Atlanta', 'GA', ['13089', '13121']],
    ['Decatur', 'GA', ['13089']],
    ['Decatur', 'AL', ['01083', '01103']],
    ['Añasco', 'PR', ['72011']],
    ['St. Marys', 'GA', ['13039']],
  ],
})

describe('buildPlaceSearchIndex', () => {
  test('expands multi-county places into one option per county', () => {
    const atlanta = index.entries.filter((e) => e.coreName === 'atlanta')
    expect(atlanta.map((e) => e.option.label)).toEqual([
      'Atlanta, GA → DeKalb County',
      'Atlanta, GA → Fulton County',
    ])
    expect(atlanta.map((e) => e.option.countyFips)).toEqual(['13089', '13121'])
  })

  test('options carry unique ids for highlight tracking', () => {
    const ids = index.entries.map((e) => e.option.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('searchPlaces', () => {
  test('matches by name, postal code, and full state name', () => {
    for (const query of ['atlanta', 'atlanta ga', 'atlanta georgia']) {
      const labels = searchPlaces(index, query).map((o) => o.label)
      expect(labels).toContain('Atlanta, GA → Fulton County')
    }
  })

  test('state qualifier ranks the in-state place first', () => {
    const results = searchPlaces(index, 'decatur al')
    expect(results[0].label).toMatch(/^Decatur, AL/)
  })

  test('tolerates typos and diacritics', () => {
    expect(searchPlaces(index, 'atalanta')[0].label).toMatch(/^Atlanta/)
    expect(searchPlaces(index, 'anasco')[0].label).toMatch(/^Añasco/)
  })

  test('"saint marys" matches the abbreviated St. Marys', () => {
    expect(searchPlaces(index, 'saint marys')[0].label).toMatch(/^St\. Marys/)
  })

  test('requires at least two characters and respects the limit', () => {
    expect(searchPlaces(index, 'a')).toEqual([])
    expect(searchPlaces(index, '')).toEqual([])
    expect(searchPlaces(index, 'decatur', 1)).toHaveLength(1)
  })
})
