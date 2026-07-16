import { HIV_DISEASE_METRICS } from '../data/config/MetricConfigHivCategory'
import {
  VOTER_PARTICIPATION_METRICS,
  WOMEN_IN_GOV_METRICS,
} from '../data/config/MetricConfigPDOH'
import type { DataTypeId } from '../data/config/MetricConfigTypes'
import { Fips } from '../data/utils/Fips'
import {
  configsContainsMatchingId,
  getAllDemographicOptions,
  isStateCountyLevel,
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

  test('empty configs with bothNeedToMatch returns false, not vacuous true', () => {
    expect(
      configsContainsMatchingId(
        /* configs */ [],
        /* ids */ ['voter_participation' as DataTypeId],
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
      'Race/Ethnicity': 'race_and_ethnicity',
    })
  })

  test('CAWP National disabled options', () => {
    expect(disabledDemographicOptions).toEqual([
      ['Age', 'unavailable for Women in elective office topics'],
      ['Sex', 'unavailable for Women in elective office topics'],
    ])
  })

  test('null config (no dt1 in URL) returns standard options, not PHRMA income/insurance', () => {
    const { enabledDemographicOptionsMap: opts } = getAllDemographicOptions(
      null,
      new Fips('00'),
    )
    expect(opts).toEqual({
      'Race/Ethnicity': 'race_and_ethnicity',
      'Sex at Birth': 'sex',
      Age: 'age',
    })
    expect(Object.values(opts)).not.toContain('income')
    expect(Object.values(opts)).not.toContain('insurance_status')
  })

  test('HIV config returns standard options without income or insurance', () => {
    const { enabledDemographicOptionsMap: opts } = getAllDemographicOptions(
      HIV_DISEASE_METRICS[0],
      new Fips('00'),
    )
    expect(Object.values(opts)).not.toContain('income')
    expect(Object.values(opts)).not.toContain('insurance_status')
  })

  test('comparing two different topics offers the union of their options', () => {
    const { enabledDemographicOptionsMap: opts, disabledDemographicOptions } =
      getAllDemographicOptions(
        HIV_DISEASE_METRICS[0],
        new Fips('00'),
        womenCongressConfig,
        new Fips('00'),
      )
    // HIV brings race/sex/age even though CAWP alone is race-only;
    // the CAWP side falls back to combined 'All' rates
    expect(opts).toEqual({
      'Race/Ethnicity': 'race_and_ethnicity',
      'Sex at Birth': 'sex',
      Age: 'age',
    })
    const disabledLabels = disabledDemographicOptions.map(
      ([option]: string[]) => option,
    )
    expect(disabledLabels).not.toContain('Age')
  })

  test('comparing the same topic in two places keeps single-topic options', () => {
    const { enabledDemographicOptionsMap: opts } = getAllDemographicOptions(
      womenCongressConfig,
      new Fips('01'),
      womenCongressConfig,
      new Fips('13'),
    )
    expect(opts).toEqual({
      'Race/Ethnicity': 'race_and_ethnicity',
    })
  })
})
