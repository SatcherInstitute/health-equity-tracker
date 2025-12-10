import type FakeDataFetcher from '../../testing/FakeDataFetcher'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import type { ScrollableHashId } from '../../utils/hooks/useStepObserver'
import { type DatasetId, DatasetMetadataMap } from '../config/DatasetMetadata'
import type { DataTypeId, MetricId } from '../config/MetricConfigTypes'
import {
  Breakdowns,
  type DemographicType,
  type TimeView,
} from '../query/Breakdowns'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { AGE, RACE, SEX } from '../utils/Constants'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import { Fips } from '../utils/Fips'
import GunViolenceProvider from './GunViolenceProvider'

async function ensureCorrectDatasetsDownloaded(
  gunViolenceDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
  dataTypeId?: DataTypeId,
  timeView?: TimeView,
  metricIds?: MetricId[],
  scrollToHashId?: ScrollableHashId,
) {
  // If these aren't sent as args, default to []
  metricIds = metricIds || []

  const gunViolenceProvider = new GunViolenceProvider()
  const specificDatasetId = appendFipsIfNeeded(
    gunViolenceDatasetId,
    baseBreakdown,
  )
  dataFetcher.setFakeDatasetLoaded(specificDatasetId, [])

  // Evaluate the response by requesting "All" field
  const responseIncludingAll = await gunViolenceProvider.getData(
    new MetricQuery(
      metricIds,
      baseBreakdown.addBreakdown(demographicType),
      dataTypeId,
      timeView,
      scrollToHashId,
    ),
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  const consumedDatasetIds = [gunViolenceDatasetId]

  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], consumedDatasetIds),
  )
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('GunViolenceProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('Current State and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_wisqars_data-age_national_current',
      Breakdowns.forFips(new Fips('00')),
      AGE,
      'gun_violence',
      'current',
    )
  })

  test('Historical National and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_wisqars_data-race_and_ethnicity_national_historical',
      Breakdowns.forFips(new Fips('00')),
      RACE,
      'gun_violence',
      'historical',
    )
  })

  test('Current State and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_wisqars_data-sex_national_historical',
      Breakdowns.forFips(new Fips('00')),
      SEX,
      'gun_violence',
      'historical',
    )
  })

  test('Historical County and Alls Breakdown - Overall Gun Deaths from CHR', async () => {
    await ensureCorrectDatasetsDownloaded(
      'chr_data-race_and_ethnicity_county_historical',
      Breakdowns.forFips(new Fips('01001')),
      RACE, // falls back to ALLS
      'gun_deaths',
      'historical',
    )
  })

  test('Current County and Alls Breakdown - Gun Homicides from CDC MIOVD', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_miovd_data-alls_county_current',
      Breakdowns.forFips(new Fips('01001')),
      RACE, // falls back to ALLS
      'gun_violence_homicide',
      'current',
      ['gun_violence_homicide_per_100k'],
      'rate-map', // in tests we always need a scrollToHashId to enable the fallbackId logic
    )
  })
})
