import type { DatasetId } from '../config/DatasetMetadata'
import type { MetricId } from '../config/MetricConfigTypes'
import { MetricQueryResponse } from '../query/MetricQuery'
import { RACE } from '../utils/Constants'

let metricQueryResponse: MetricQueryResponse

describe('MetricQueryResponse', () => {
  beforeEach(() => {
    metricQueryResponse = new MetricQueryResponse(
      [
        {
          fips: '01',
          race_and_ethnicity: 'White',
          covid_cases: 7,
          invalid: undefined,
        },
        {
          fips: '01',
          race_and_ethnicity: 'White (NH)',
          covid_cases: 'abc',
          invalid: undefined,
        },
        {
          fips: '01',
          race_and_ethnicity: 'Asian',
          covid_cases: 2,
          invalid: undefined,
        },
        {
          fips: '01',
          race_and_ethnicity: 'Asian (NH)',
          covid_cases: undefined,
          covid_hosp: null, // null should also be ignored as invalid
          invalid: undefined,
        },
        {
          fips: '01',
          race_and_ethnicity: 'Native Hawaiian and Pacific Islander (NH)',
          covid_cases: 0, // 0 should be the min
          covid_hosp: 1, // 1 should be the min
          invalid: undefined,
        },
        {
          fips: '02',
          race_and_ethnicity: 'White',
          covid_cases: 12,
          covid_hosp: 12,
          invalid: undefined,
        },
        {
          fips: '02',
          race_and_ethnicity: 'Asian',
          covid_cases: 5,
          invalid: undefined,
        },
      ],
      ['dataset1' as DatasetId],
    )
  })

  test('getFieldRange()', async () => {
    expect(metricQueryResponse.getFieldRange('covid_cases')).toEqual({
      min: 0,
      max: 12,
    })
    expect(metricQueryResponse.getFieldRange('covid_hosp')).toEqual({
      min: 1,
      max: 12,
    })
    expect(metricQueryResponse.getFieldRange(RACE as MetricId)).toEqual(
      undefined,
    )
  })

  test('getUniqueFieldValues()', async () => {
    const targetMetric = 'covid_cases'

    expect(metricQueryResponse.getFieldValues(RACE, targetMetric)).toEqual({
      noData: ['White (NH)', 'Asian (NH)'],
      withData: ['White', 'Asian', 'Native Hawaiian and Pacific Islander (NH)'],
    })

    expect(metricQueryResponse.getFieldValues('fips', targetMetric)).toEqual({
      noData: [],
      withData: ['01', '02'],
    })
  })

  test('fieldHasMissingValues()', async () => {
    expect(metricQueryResponse.invalidValues).toEqual({
      covid_cases: 1,
      covid_hosp: 1,
      invalid: 7,
    })
    expect(metricQueryResponse.isFieldMissing('covid_cases')).toEqual(false)
  })
})
