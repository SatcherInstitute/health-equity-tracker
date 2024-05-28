import AhrProvider from './AhrProvider'
import { Breakdowns, DemographicType } from '../query/Breakdowns'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { Fips } from '../utils/Fips'
import {
  DatasetId,
  DatasetIdWithStateFIPSCode,
  DatasetMetadataMap,
} from '../config/DatasetMetadata'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import FakeDataFetcher from '../../testing/FakeDataFetcher'
import { RACE, AGE, SEX } from '../utils/Constants'
import { expect, describe, test, beforeEach } from 'vitest'
import { appendFipsIfNeeded } from '../utils/datasetutils'

export async function ensureCorrectDatasetsDownloaded(
  ahrDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType
) {
  const ahrProvider = new AhrProvider()
  const specificId = appendFipsIfNeeded(ahrDatasetId, baseBreakdown)


  dataFetcher.setFakeDatasetLoaded(specificId, [])


  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await ahrProvider.getData(
    new MetricQuery(['suicide_per_100k'], baseBreakdown.addBreakdown(demographicType), 'suicide', 'current')
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  const consumedDatasetIds: Array<DatasetId | DatasetIdWithStateFIPSCode> = [
    ahrDatasetId,
  ]
  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], consumedDatasetIds)
  )
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('AhrProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('State and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'ahr_data-race_and_ethnicity_state',
      Breakdowns.forFips(new Fips('37')),
      RACE
    )
  })

  test('National and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'ahr_data-race_and_ethnicity_national',
      Breakdowns.forFips(new Fips('00')),
      RACE
    )
  })

  test('State and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'ahr_data-age_state',
      Breakdowns.forFips(new Fips('37')),
      AGE
    )
  })

  test('National and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'ahr_data-age_national',
      Breakdowns.forFips(new Fips('00')),
      AGE
    )
  })

  test('State and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'ahr_data-sex_state',
      Breakdowns.forFips(new Fips('37')),
      SEX
    )
  })

  test('National and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'ahr_data-sex_national',
      Breakdowns.forFips(new Fips('00')),
      SEX
    )
  })

  test('County and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'chr_data-race_and_ethnicity_county_current',
      Breakdowns.forFips(new Fips('01001')),
      RACE
    )
  })


  test('County and Sex Breakdown (should just get the ALLs)', async () => {
    await ensureCorrectDatasetsDownloaded(
      'chr_data-race_and_ethnicity_county_current',
      Breakdowns.forFips(new Fips('01001')),
      SEX
    )
  })
})
