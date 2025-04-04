import type FakeDataFetcher from '../../testing/FakeDataFetcher'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import { type DatasetId, DatasetMetadataMap } from '../config/DatasetMetadata'
import type { MetricId } from '../config/MetricConfigTypes'
import { Breakdowns, type DemographicType } from '../query/Breakdowns'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { AGE, RACE } from '../utils/Constants'
import { Fips } from '../utils/Fips'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import PhrmaProvider from './PhrmaProvider'

async function ensureCorrectDatasetsDownloaded(
  PhrmaDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
  acsDatasetIds?: DatasetId[],
  metricIds?: MetricId[],
) {
  // if these aren't sent as args, default to []
  metricIds = metricIds || []
  acsDatasetIds = acsDatasetIds || []

  const phrmaProvider = new PhrmaProvider()
  const specificDatasetId = appendFipsIfNeeded(PhrmaDatasetId, baseBreakdown)
  dataFetcher.setFakeDatasetLoaded(specificDatasetId, [])

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await phrmaProvider.getData(
    new MetricQuery(
      metricIds,
      baseBreakdown.addBreakdown(demographicType),
      undefined,
    ),
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  const consumedDatasetIds = [PhrmaDatasetId]
  consumedDatasetIds.push(...acsDatasetIds)

  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], consumedDatasetIds),
  )
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('PhrmaProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('National and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'phrma_data-race_and_ethnicity_national_current',
      Breakdowns.forFips(new Fips('00')),
      RACE,
    )
  })

  test('State and LIS Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'phrma_data-lis_state_current',
      Breakdowns.forFips(new Fips('02')),
      'lis',
    )
  })

  test('County and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'phrma_data-age_county_current',
      Breakdowns.forFips(new Fips('02999')),
      AGE,
    )
  })
})
