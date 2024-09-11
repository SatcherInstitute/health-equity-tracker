import AcsPopulationProvider from './AcsPopulationProvider'
import { Breakdowns, type DemographicType } from '../query/Breakdowns'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { Fips } from '../utils/Fips'
import {
  type DatasetId,
  DatasetIdWithStateFIPSCode,
  DatasetMetadataMap,
} from '../config/DatasetMetadata'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import type FakeDataFetcher from '../../testing/FakeDataFetcher'
import { RACE, AGE, SEX } from '../utils/Constants'
import { appendFipsIfNeeded } from '../utils/datasetutils'

async function ensureCorrectDatasetsDownloaded(
  acsDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
) {
  const acsPopulationProvider = new AcsPopulationProvider()
  const specificId = appendFipsIfNeeded(acsDatasetId, baseBreakdown)
  dataFetcher.setFakeDatasetLoaded(specificId, [])

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await acsPopulationProvider.getData(
    new MetricQuery([], baseBreakdown.addBreakdown(demographicType)),
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  expect(responseIncludingAll.consumedDatasetIds).toContain(acsDatasetId)
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('AcsPopulationProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('County and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_population-by_race_county',
      Breakdowns.forFips(new Fips('01001')),
      RACE,
    )
  })

  test('State and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_population-by_race_state',
      Breakdowns.forFips(new Fips('37')),
      RACE,
    )
  })

  test('National and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_population-by_race_national',
      Breakdowns.forFips(new Fips('00')),
      RACE,
    )
  })

  test('County and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_population-by_age_county',
      Breakdowns.forFips(new Fips('02013')),
      AGE,
    )
  })

  test('State and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_population-by_age_state',
      Breakdowns.forFips(new Fips('37')),
      AGE,
    )
  })

  test('National and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_population-by_age_national',
      Breakdowns.forFips(new Fips('00')),
      AGE,
    )
  })

  test('County and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_population-by_sex_county',
      Breakdowns.forFips(new Fips('37001')),
      SEX,
    )
  })

  test('State and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_population-by_sex_state',
      Breakdowns.forFips(new Fips('37')),
      SEX,
    )
  })

  test('National and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_population-by_sex_national',
      Breakdowns.forFips(new Fips('00')),
      SEX,
    )
  })
})
