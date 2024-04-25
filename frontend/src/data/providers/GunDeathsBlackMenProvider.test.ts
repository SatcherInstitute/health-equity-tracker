import { appendFipsIfNeeded } from '../utils/datasetutils'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import { Breakdowns, DemographicType, TimeView } from '../query/Breakdowns'
import { DatasetId, DatasetMetadataMap } from '../config/DatasetMetadata'
import { DataTypeId } from '../config/MetricConfig'
import { Fips } from '../utils/Fips'
import { MetricId } from '../config/MetricConfig'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import FakeDataFetcher from '../../testing/FakeDataFetcher'
import GunDeathsBlackMenProvider from './GunDeathsBlackMenProvider'
import {
  expect,
  describe, test, beforeEach
} from 'vitest'


export async function ensureCorrectDatasetsDownloaded(
  gunViolenceDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
  dataTypeId?: DataTypeId,
  timeView?: TimeView,
  metricIds?: MetricId[]
) {
  // If these aren't sent as args, default to []
  metricIds = metricIds || []

  const gunDeathsBlackMenProvider = new GunDeathsBlackMenProvider()
  const specificDatasetId = appendFipsIfNeeded(
    gunViolenceDatasetId,
    baseBreakdown
  )

  dataFetcher.setFakeDatasetLoaded(specificDatasetId, [])

  // Evaluate the response by requesting "All" field
  const responseIncludingAll = await gunDeathsBlackMenProvider.getData(
    new MetricQuery(
      metricIds,
      baseBreakdown.addBreakdown(demographicType),
      dataTypeId,
      timeView
    )
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  const consumedDatasetIds = [gunViolenceDatasetId]

  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], consumedDatasetIds)
  )
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('GunDeathsBlackMenProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('Historical National and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_wisqars_black_men_data-black_men_by_age_national_historical',
      Breakdowns.forFips(new Fips('00')),
      'age',
      'gun_deaths_black_men',
      'historical'
    )
  })

  test('Current State and Urbanicity Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_wisqars_black_men_data-black_men_by_urbanicity_state_current',
      Breakdowns.forFips(new Fips('01')),
      'urbanicity',
      'gun_deaths_black_men',
      'current'
    )
  })
})