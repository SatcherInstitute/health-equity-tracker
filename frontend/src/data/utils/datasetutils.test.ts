import type { DatasetId } from '../config/DatasetMetadata'
import {
  type MetricId,
  METRIC_CONFIG,
  type DataTypeConfig,
} from '../config/MetricConfig'
import { Breakdowns, type DemographicType } from '../query/Breakdowns'
import {
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
