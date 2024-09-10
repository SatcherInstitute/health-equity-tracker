import type { DataTypeId } from '../data/config/MetricConfigTypes'
import {
  VOTER_PARTICIPATION_METRICS,
  WOMEN_IN_GOV_METRICS,
} from '../data/config/MetricConfigPDOH'
import { Fips } from '../data/utils/Fips'
import {
  isStateCountyLevel,
  configsContainsMatchingId,
  getAllDemographicOptions,
} from './reportUtils'

describe('Test isStateCountyLevel()', () => {
  test('National', () => {
    expect(isStateCountyLevel(new Fips('00'))).toBe(false)
  })
  test('State', () => {
    expect(isStateCountyLevel(new Fips('01'))).toBe(true)
  })
  test('County', () => {
    expect(isStateCountyLevel(new Fips('01001'))).toBe(true)
  })
  test('compare Nationals', () => {
    expect(isStateCountyLevel(new Fips('00'), new Fips('00'))).toBe(false)
  })
  test('compare National / county', () => {
    expect(isStateCountyLevel(new Fips('00'), new Fips('00001'))).toBe(true)
  })
  test('compare states', () => {
    expect(isStateCountyLevel(new Fips('02'), new Fips('02'))).toBe(true)
  })
})

describe('Test configsContainsMatchingId()', () => {
  test('config contains an id', () => {
    expect(
      configsContainsMatchingId(
        /* configs */ VOTER_PARTICIPATION_METRICS,
        /* ids */ [
          'voter_participation',
          'something' as DataTypeId,
          'something_else' as DataTypeId,
        ],
      ),
    ).toBe(true)
  })

  test('config does not contain an id', () => {
    expect(
      configsContainsMatchingId(
        /* configs */ VOTER_PARTICIPATION_METRICS,
        /* ids */ ['something' as DataTypeId, 'something_else' as DataTypeId],
      ),
    ).toBe(false)
  })

  test('at least one of two configs contain an id ', () => {
    expect(
      configsContainsMatchingId(
        /* configs */ WOMEN_IN_GOV_METRICS,
        /* ids */ [
          'women_in_us_congress',
          'something' as DataTypeId,
          'something_else' as DataTypeId,
        ],
      ),
    ).toBe(true)
  })

  test('only one of two configs contain an id, require both', () => {
    expect(
      configsContainsMatchingId(
        /* configs */ WOMEN_IN_GOV_METRICS,
        /* ids */ [
          'women_in_us_congress',
          'something' as DataTypeId,
          'something_else' as DataTypeId,
        ],
        /* bothNeedToMatch? */ true,
      ),
    ).toBe(false)
  })
})

describe('Test getAllDemographicOptions()', () => {
  const womenCongressConfig = WOMEN_IN_GOV_METRICS[0]

  const { enabledDemographicOptionsMap, disabledDemographicOptions } =
    getAllDemographicOptions(womenCongressConfig, new Fips('00'))

  test('CAWP National enabled options', () => {
    expect(enabledDemographicOptionsMap).toEqual({
      'Race/ethnicity': 'race_and_ethnicity',
    })
  })

  test('CAWP National disabled options', () => {
    expect(disabledDemographicOptions).toEqual([
      ['Age', 'unavailable for Women in elective office topics'],
      ['Sex', 'unavailable for Women in elective office topics'],
    ])
  })
})
