import CdcCovidProvider, { dropRecentPartialMonth } from './CdcCovidProvider'
import { Breakdowns, type DemographicType } from '../query/Breakdowns'
import { MetricQuery } from '../query/MetricQuery'
import { Fips } from '../utils/Fips'
import { type DatasetId, DatasetMetadataMap } from '../config/DatasetMetadata'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import type FakeDataFetcher from '../../testing/FakeDataFetcher'
import { CHATAM, NC, VI, USA } from './TestUtils'
import { RACE, SEX, AGE } from '../utils/Constants'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import { DataFrame } from 'data-forge'

async function ensureCorrectDatasetsDownloaded(
  cdcDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
) {
  const cdcCovidProvider = new CdcCovidProvider()

  const specificId = appendFipsIfNeeded(cdcDatasetId, baseBreakdown)
  dataFetcher.setFakeDatasetLoaded(specificId, [])

  const responseIncludingAll = await cdcCovidProvider.getData(
    new MetricQuery([], baseBreakdown.addBreakdown(demographicType)),
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)
  expect(responseIncludingAll.consumedDatasetIds).toContain(cdcDatasetId)
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('cdcCovidProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('National and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-by_sex_national_processed',
      Breakdowns.forFips(new Fips(USA.code)),
      SEX,
    )
  })

  test('National and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-by_age_national_processed',
      Breakdowns.forFips(new Fips(USA.code)),
      AGE,
    )
  })

  test('National and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-by_race_national_processed-with_age_adjust',
      Breakdowns.forFips(new Fips(USA.code)),
      RACE,
    )
  })

  test('State and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-by_age_state_processed',
      Breakdowns.forFips(new Fips(NC.code)),
      AGE,
    )
  })

  test('State and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-by_sex_state_processed',
      Breakdowns.forFips(new Fips(NC.code)),
      SEX,
    )
  })

  test('State and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-by_race_state_processed-with_age_adjust',
      Breakdowns.forFips(new Fips(NC.code)),
      RACE,
    )
  })

  test('County and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-by_age_county_processed',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      AGE,
    )
  })

  test('County and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-by_sex_county_processed',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      SEX,
    )
  })

  test('County and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-by_race_county_processed',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      RACE,
    )
  })

  test('population source acs 2020', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-by_sex_state_processed',
      Breakdowns.forFips(new Fips(VI.code)),
      'sex',
    )
  })
})

describe('dropRecentPartialMonth', () => {
  it('should drop rows with the most recent time period', () => {
    const data = [
      { time_period: '2024-01', value: 10 },
      { time_period: '2024-02', value: 20 },
      { time_period: '2024-03', value: 30 },
    ]

    const df = new DataFrame(data)
    const result = dropRecentPartialMonth(df)

    expect(result.toArray()).toEqual([
      { time_period: '2024-01', value: 10 },
      { time_period: '2024-02', value: 20 },
    ])
  })

  it('should handle an empty DataFrame', () => {
    const df = new DataFrame([])
    const result = dropRecentPartialMonth(df)

    expect(result.toArray()).toEqual([])
  })

  it('should handle a DataFrame with non-sequential time periods', () => {
    const data = [
      { time_period: '2023-12', value: 10 },
      { time_period: '2024-01', value: 20 },
      { time_period: '2024-03', value: 30 },
    ]

    const df = new DataFrame(data)
    const result = dropRecentPartialMonth(df)

    expect(result.toArray()).toEqual([
      { time_period: '2023-12', value: 10 },
      { time_period: '2024-01', value: 20 },
    ])
  })
})
