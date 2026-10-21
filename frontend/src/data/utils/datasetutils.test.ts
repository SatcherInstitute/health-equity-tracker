import type { DatasetId } from '../config/DatasetMetadata'
import { METRIC_CONFIG } from '../config/MetricConfig'
import type {
  DataTypeConfig,
  MetricConfig,
  MetricId,
} from '../config/MetricConfigTypes'
import { Breakdowns, type DemographicType } from '../query/Breakdowns'
import {
  allMissingValuesAreSuppressed,
  appendFipsIfNeeded,
  getExclusionList,
  getExtremeValues,
  splitIntoKnownsAndUnknowns,
} from './datasetutils'
import { Fips } from './Fips'

describe('DatasetUtils.getExtremeValues() Unit Tests', () => {
  const data = [
    { some_condition: 0 },
    { some_condition: 3 },
    { some_condition: 4 },
    { some_condition: 5 },
    { some_condition: 6 },
    { some_condition: 7 },
    { some_condition: 0 },
    { some_condition: 0 },
    { some_condition: 8 },
    { some_condition: 9 },
    { some_condition: 10 },
  ]

  const { lowestValues, highestValues } = getExtremeValues(
    data,
    'some_condition' as MetricId,
    5,
  )

  test('5 Normal Highs', async () => {
    expect(highestValues).toEqual([
      { some_condition: 10 },
      { some_condition: 9 },
      { some_condition: 8 },
      { some_condition: 7 },
      { some_condition: 6 },
    ])
  })

  test('Tied Lows', async () => {
    expect(lowestValues).toEqual([
      { some_condition: 0 },
      { some_condition: 0 },
      { some_condition: 0 },
    ])
  })

  test('8 Normal Highs, Tied Lows Removed From Highs', async () => {
    const { lowestValues, highestValues } = getExtremeValues(
      data,
      'some_condition' as MetricId,
      10,
    )
    expect(highestValues).toEqual([
      { some_condition: 10 },
      { some_condition: 9 },
      { some_condition: 8 },
      { some_condition: 7 },
      { some_condition: 6 },
      { some_condition: 5 },
      { some_condition: 4 },
      { some_condition: 3 },
    ])
    expect(lowestValues).toEqual([
      { some_condition: 0 },
      { some_condition: 0 },
      { some_condition: 0 },
    ])
  })

  test("Empty doesn't break", async () => {
    const { lowestValues, highestValues } = getExtremeValues(
      [],
      'some_condition' as MetricId,
      5,
    )
    expect(highestValues).toEqual([])
    expect(lowestValues).toEqual([])
  })

  test("All-null rows don't break", async () => {
    const { lowestValues, highestValues } = getExtremeValues(
      [{ some_condition: null }, { some_condition: null }],
      'some_condition' as MetricId,
      5,
    )
    expect(highestValues).toEqual([])
    expect(lowestValues).toEqual([])
  })
})

describe('DatasetUtils.allMissingValuesAreSuppressed() Unit Tests', () => {
  const metricConfig = {
    metricId: 'some_condition' as MetricId,
    suppressionFlagMetricId: 'some_condition_is_suppressed' as MetricId,
  } as MetricConfig

  test('true only when every gap is flagged suppressed', async () => {
    expect(
      allMissingValuesAreSuppressed(
        [
          { some_condition: 5 },
          { some_condition: null, some_condition_is_suppressed: true },
        ],
        metricConfig,
      ),
    ).toBe(true)
  })

  test('false when any gap is unexplained', async () => {
    expect(
      allMissingValuesAreSuppressed(
        [
          { some_condition: null, some_condition_is_suppressed: true },
          { some_condition: null },
        ],
        metricConfig,
      ),
    ).toBe(false)
  })

  test('false when nothing is missing at all', async () => {
    expect(
      allMissingValuesAreSuppressed([{ some_condition: 5 }], metricConfig),
    ).toBe(false)
  })

  test('false when the metric declares no suppression flag', async () => {
    expect(
      allMissingValuesAreSuppressed(
        [{ some_condition: null, some_condition_is_suppressed: true }],
        { metricId: 'some_condition' as MetricId } as MetricConfig,
      ),
    ).toBe(false)
  })
})

describe('DatasetUtils.appendFipsIfNeeded() Unit Tests', () => {
  // Only county-level breakdowns should get the appended parent fips
  const base_id = 'base_dataset_id' as DatasetId

  test('County Level', async () => {
    const breakdowns_for_county = Breakdowns.forFips(new Fips('06037'))
    const generated_county_set_id = appendFipsIfNeeded(
      base_id,
      breakdowns_for_county,
    )
    expect(generated_county_set_id).toEqual(base_id + '-06')
  })

  test('State Level', async () => {
    const breakdowns_for_state = Breakdowns.forFips(new Fips('06'))
    const generated_state_set_id = appendFipsIfNeeded(
      base_id,
      breakdowns_for_state,
    )
    expect(generated_state_set_id).toEqual(base_id)
  })

  test('National Level', async () => {
    const breakdowns_for_USA = Breakdowns.forFips(new Fips('00'))
    const generated_USA_set_id = appendFipsIfNeeded(base_id, breakdowns_for_USA)
    expect(generated_USA_set_id).toEqual(base_id)
  })
})

describe('DatasetUtils.getExclusionList() Tests', () => {
  test('Prison by Race in USA Exclusions', async () => {
    const sampleDataTypeConfigPrisonRaceUSA: DataTypeConfig =
      METRIC_CONFIG.incarceration[0]
    const sampleBreakdownPrisonRaceUSA: DemographicType = 'race_and_ethnicity'
    const sampleFipsPrisonRaceUSA: Fips = new Fips('00')
    const expectedExclusionListPrisonRaceUSA = [
      'Unknown',
      'Unknown ethnicity',
      'Unknown race',
      'Not Hispanic or Latino',
      'Indigenous',
      'Asian',
      'Black or African American',
      'Native Hawaiian and Pacific Islander',
      'Two or more races',
      'White',
      'Unrepresented race',
      'Two or more races & Unrepresented race',
      'Two or more races & Unrepresented race (NH)',
      'Asian, Native Hawaiian, and Pacific Islander (NH)',
    ]
    const sampleExclusionListPrisonRaceUSA = getExclusionList(
      sampleDataTypeConfigPrisonRaceUSA,
      sampleBreakdownPrisonRaceUSA,
      sampleFipsPrisonRaceUSA,
    )
    expect(sampleExclusionListPrisonRaceUSA).toEqual(
      expectedExclusionListPrisonRaceUSA,
    )
  })
  test('Diabetes by Sex in AL Exclusions', async () => {
    const sampleDataTypeConfigDiabetesSexAlabama: DataTypeConfig =
      METRIC_CONFIG.diabetes[0]
    const sampleBreakdownDiabetesSexAlabama: DemographicType = 'sex'
    const sampleFipsDiabetesSexAlabama: Fips = new Fips('01')
    const expectedExclusionListDiabetesSexAlabama = [
      'Unknown',
      'Unknown ethnicity',
      'Unknown race',
      'All',
    ]
    const sampleExclusionListDiabetesSexAlabama = getExclusionList(
      sampleDataTypeConfigDiabetesSexAlabama,
      sampleBreakdownDiabetesSexAlabama,
      sampleFipsDiabetesSexAlabama,
    )
    expect(sampleExclusionListDiabetesSexAlabama).toEqual(
      expectedExclusionListDiabetesSexAlabama,
    )
  })
  test('Prison by Race resolves county vs non-county geography differently', async () => {
    const prisonConfig: DataTypeConfig = METRIC_CONFIG.incarceration[0]
    const race: DemographicType = 'race_and_ethnicity'

    const countyList = getExclusionList(prisonConfig, race, new Fips('01001'))
    // county reports Asian and NHPI split out rather than the combined API group
    expect(countyList).toContain('Asian (NH)')
    expect(countyList).toContain('Native Hawaiian and Pacific Islander (NH)')
    expect(countyList).not.toContain(
      'Asian, Native Hawaiian, and Pacific Islander (NH)',
    )

    const nationalList = getExclusionList(prisonConfig, race, new Fips('00'))
    expect(nationalList).toContain(
      'Asian, Native Hawaiian, and Pacific Islander (NH)',
    )
    expect(nationalList).not.toContain('Asian (NH)')
  })
  test('AHR determinant by Age keeps only its own age buckets', async () => {
    const diabetesConfig: DataTypeConfig = METRIC_CONFIG.diabetes[0]
    const age: DemographicType = 'age'
    const ageList = getExclusionList(diabetesConfig, age, new Fips('00'))
    // diabetes uses the broad AHR buckets, so finer buckets are excluded while
    // the broad buckets it reports are not
    expect(ageList).toContain('18-24')
    expect(ageList).not.toContain('18-44')
    // the maternal and birth-outcome buckets in the shared AHR file are not its own
    expect(ageList).toContain('15-19')
    expect(ageList).toContain('<20')
    expect(ageList).toContain('35+')
  })
  test('AHR birth outcomes by Age keep the mother-age buckets', async () => {
    const age: DemographicType = 'age'
    for (const config of [
      METRIC_CONFIG.infant_mortality[0],
      METRIC_CONFIG.low_birthweight[0],
    ]) {
      const ageList = getExclusionList(config, age, new Fips('00'))
      for (const bucket of [
        '15-19',
        '20-24',
        '25-29',
        '30-34',
        '35-39',
        '40-44',
      ]) {
        expect(ageList).not.toContain(bucket)
      }
      expect(ageList).toContain('18-44')
      expect(ageList).toContain('<20')
      expect(ageList).toContain('35+')
    }
  })
  test('AHR severe maternal morbidity keeps its own age and race groups', async () => {
    const smmConfig: DataTypeConfig = METRIC_CONFIG.severe_maternal_morbidity[0]
    const ageList = getExclusionList(smmConfig, 'age', new Fips('00'))
    for (const bucket of ['<20', '20-24', '25-29', '30-34', '35+']) {
      expect(ageList).not.toContain(bucket)
    }
    expect(ageList).toContain('18-44')
    expect(ageList).toContain('15-19')

    const raceList = getExclusionList(
      smmConfig,
      'race_and_ethnicity',
      new Fips('00'),
    )
    // SMM reports the combined Asian/Pacific Islander group, not the split ones
    expect(raceList).not.toContain(
      'Asian, Native Hawaiian, and Pacific Islander (NH)',
    )
    expect(raceList).toContain('Asian (NH)')
    expect(raceList).toContain('Two or more races (NH)')
  })
  test('AHR low-risk cesarean keeps only the race groups AHR reports', async () => {
    const raceList = getExclusionList(
      METRIC_CONFIG.low_risk_cesarean[0],
      'race_and_ethnicity',
      new Fips('00'),
    )
    for (const group of [
      'Black or African American (NH)',
      'Hispanic or Latino',
      'White (NH)',
    ]) {
      expect(raceList).not.toContain(group)
    }
    expect(raceList).toContain('Asian (NH)')
    expect(raceList).toContain('Indigenous (NH)')
    expect(raceList).toContain('Unrepresented race (NH)')
  })
})

describe('DatasetUtils.splitIntoKnownsAndUnknowns() Unit Tests', () => {
  test('good data with known and unknown demographic groups splits as expected', async () => {
    const goodData = [
      {
        age: '0-100',
        condition_pct_share: 50,
      },
      {
        age: 'Unknown',
        condition_pct_share: 50,
      },
    ]
    const [knowns, unknowns] = splitIntoKnownsAndUnknowns(goodData, 'age')
    expect(knowns).toEqual([
      {
        age: '0-100',
        condition_pct_share: 50,
      },
    ])
    expect(unknowns).toEqual([
      {
        age: 'Unknown',
        condition_pct_share: 50,
      },
    ])
  })

  test('undefined data results in empty arrays for known and unknown', async () => {
    const missingData = undefined
    const [knowns, unknowns] = splitIntoKnownsAndUnknowns(missingData, 'age')
    expect(knowns).toEqual([])
    expect(unknowns).toEqual([])
  })
})
