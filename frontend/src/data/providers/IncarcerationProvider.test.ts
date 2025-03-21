import { beforeEach, describe, expect, test } from 'vitest'
import type FakeDataFetcher from '../../testing/FakeDataFetcher'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import { type DatasetId, DatasetMetadataMap } from '../config/DatasetMetadata'
import type { DataTypeId } from '../config/MetricConfigTypes'
import {
  Breakdowns,
  type DemographicType,
  type TimeView,
} from '../query/Breakdowns'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { AGE, RACE, SEX } from '../utils/Constants'
import { Fips } from '../utils/Fips'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import IncarcerationProvider from './IncarcerationProvider'

async function ensureCorrectDatasetsDownloaded(
  IncarcerationDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
  dataTypeId: DataTypeId,
  acsDatasetIds?: DatasetId[],
  timeView?: TimeView,
) {
  // if these aren't sent as args, default to []
  acsDatasetIds = acsDatasetIds || []

  const incarcerationProvider = new IncarcerationProvider()

  const specificId = appendFipsIfNeeded(IncarcerationDatasetId, baseBreakdown)

  dataFetcher.setFakeDatasetLoaded(specificId, [])

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await incarcerationProvider.getData(
    new MetricQuery(
      [],
      baseBreakdown.addBreakdown(demographicType),
      dataTypeId,
      timeView,
    ),
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  const consumedDatasetIds = [IncarcerationDatasetId]
  consumedDatasetIds.push(...acsDatasetIds)

  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], consumedDatasetIds),
  )
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('IncarcerationProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('County and Race Breakdown for Prison', async () => {
    await ensureCorrectDatasetsDownloaded(
      'vera_incarceration_county-race_and_ethnicity_county_historical',
      Breakdowns.forFips(new Fips('06037')),
      RACE,
      'prison',
      [],
      'historical',
    )
  })

  test('State and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'bjs_incarceration_data-race_and_ethnicity_state_current',
      Breakdowns.forFips(new Fips('37')),
      RACE,
      'jail',
      ['acs_population-race_state_current'],
    )
  })

  test('National and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'bjs_incarceration_data-race_and_ethnicity_national_current',
      Breakdowns.forFips(new Fips('00')),
      RACE,
      'jail',
      ['acs_population-race_national_current'],
    )
  })

  test('County and Age Breakdown for Jail', async () => {
    await ensureCorrectDatasetsDownloaded(
      'vera_incarceration_county-age_county_current',
      Breakdowns.forFips(new Fips('06037')),
      AGE,
      'jail',
      [],
      'current',
    )
  })

  test('State and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'bjs_incarceration_data-age_state_current',
      Breakdowns.forFips(new Fips('37')),
      AGE,
      'prison',
      ['acs_population-age_state_current'],
    )
  })

  test('National and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'bjs_incarceration_data-age_national_current',
      Breakdowns.forFips(new Fips('00')),
      AGE,
      'prison',
      ['acs_population-age_national_current'],
    )
  })

  test('County and Sex Breakdown for Jail', async () => {
    await ensureCorrectDatasetsDownloaded(
      'vera_incarceration_county-sex_county_historical',
      Breakdowns.forFips(new Fips('06037')),
      SEX,
      'jail',
      [],
      'historical',
    )
  })

  test('State and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'bjs_incarceration_data-sex_state_current',
      Breakdowns.forFips(new Fips('37')),
      SEX,
      'jail',
      ['acs_population-sex_state_current'],
    )
  })

  test('National and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'bjs_incarceration_data-sex_national_current',
      Breakdowns.forFips(new Fips('00')),
      SEX,
      'jail',
      ['acs_population-sex_national_current'],
    )
  })
})
