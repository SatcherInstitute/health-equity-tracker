import { beforeEach, describe, expect, test } from 'vitest'
import type FakeDataFetcher from '../../testing/FakeDataFetcher'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import {
  type DatasetId,
  type DatasetIdWithStateFIPSCode,
  DatasetMetadataMap,
} from '../config/DatasetMetadata'
import { Breakdowns, type DemographicType } from '../query/Breakdowns'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { AGE, RACE, SEX } from '../utils/Constants'
import { Fips } from '../utils/Fips'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import AhrProvider from './AhrProvider'

async function ensureCorrectDatasetsDownloaded(
  ahrDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
  cardId?: ScrollableHashId,
) {
  const ahrProvider = new AhrProvider()
  const specificId = appendFipsIfNeeded(ahrDatasetId, baseBreakdown)
  dataFetcher.setFakeDatasetLoaded(specificId, [])

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await ahrProvider.getData(
    new MetricQuery(
      ['suicide_per_100k'],
      baseBreakdown.addBreakdown(demographicType),
      'suicide',
      'current',
      cardId,
    ),
  )
  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  const consumedDatasetIds: Array<DatasetId | DatasetIdWithStateFIPSCode> = [
    ahrDatasetId,
  ]
  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], consumedDatasetIds),
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
      'graphql_ahr_data-behavioral_health_race_and_ethnicity_state_current',
      Breakdowns.forFips(new Fips('37')),
      RACE,
    )
  })

  test('National and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'graphql_ahr_data-behavioral_health_race_and_ethnicity_national_current',
      Breakdowns.forFips(new Fips('00')),
      RACE,
    )
  })

  test('State and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'graphql_ahr_data-behavioral_health_age_state_current',
      Breakdowns.forFips(new Fips('37')),
      AGE,
    )
  })

  test('National and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'graphql_ahr_data-behavioral_health_age_national_current',
      Breakdowns.forFips(new Fips('00')),
      AGE,
    )
  })

  test('State and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'graphql_ahr_data-behavioral_health_sex_state_current',
      Breakdowns.forFips(new Fips('37')),
      SEX,
    )
  })

  test('National and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'graphql_ahr_data-behavioral_health_sex_national_current',
      Breakdowns.forFips(new Fips('00')),
      SEX,
    )
  })

  test('County and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'chr_data-race_and_ethnicity_county_current',
      Breakdowns.forFips(new Fips('01001')),
      RACE,
    )
  })

  test('County and Sex Breakdown (should just get the ALLs)', async () => {
    await ensureCorrectDatasetsDownloaded(
      'chr_data-alls_county_current',
      Breakdowns.forFips(new Fips('01001')),
      SEX,
      'rates-over-time', // need to mock a call from a card that should get fallbacks
    )
  })
})
