import { RACE } from '../utils/Constants'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import {
  Breakdowns,
  type DemographicType,
  type TimeView,
} from '../query/Breakdowns'
import { type DatasetId, DatasetMetadataMap } from '../config/DatasetMetadata'
import type { DataTypeId } from '../config/MetricConfigTypes'
import { Fips } from '../utils/Fips'
import type { MetricId } from '../config/MetricConfigTypes'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import type FakeDataFetcher from '../../testing/FakeDataFetcher'
import GunViolenceYouthProvider from './GunViolenceYouthProvider'
import { expect, describe, test, beforeEach } from 'vitest'

async function ensureCorrectDatasetsDownloaded(
  gunViolenceDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
  dataTypeId?: DataTypeId,
  timeView?: TimeView,
  metricIds?: MetricId[],
) {
  // If these aren't sent as args, default to []
  metricIds = metricIds || []

  const gunViolenceYouthProvider = new GunViolenceYouthProvider()
  const specificDatasetId = appendFipsIfNeeded(
    gunViolenceDatasetId,
    baseBreakdown,
  )
  dataFetcher.setFakeDatasetLoaded(specificDatasetId, [])

  // Evaluate the response by requesting "All" field
  const responseIncludingAll = await gunViolenceYouthProvider.getData(
    new MetricQuery(
      metricIds,
      baseBreakdown.addBreakdown(demographicType),
      dataTypeId,
      timeView,
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

describe('GunViolenceYouthProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('Historical National and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_national_historical',
      Breakdowns.forFips(new Fips('00')),
      RACE,
      'gun_violence_youth',
      'historical',
    )
  })

  test('Current State and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_state_current',
      Breakdowns.forFips(new Fips('01')),
      RACE,
      'gun_violence_youth',
      'current',
    )
  })
})
