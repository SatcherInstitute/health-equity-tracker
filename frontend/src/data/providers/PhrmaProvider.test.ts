import PhrmaProvider from './PhrmaProvider'
import { Breakdowns, DemographicType } from '../query/Breakdowns'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { Fips } from '../utils/Fips'
import { DatasetMetadataMap } from '../config/DatasetMetadata'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import FakeDataFetcher from '../../testing/FakeDataFetcher'
import { RACE, AGE, SEX } from '../utils/Constants'
import { MetricId, DataTypeId } from '../config/MetricConfig'

export async function ensureCorrectDatasetsDownloaded(
  PhrmaDatasetId: string,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
  acsDatasetIds?: string[],
  metricIds?: MetricId[]
) {
  // if these aren't sent as args, default to []
  metricIds = metricIds || []
  acsDatasetIds = acsDatasetIds || []

  const phrmaProvider = new PhrmaProvider()

  dataFetcher.setFakeDatasetLoaded(PhrmaDatasetId, [])

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await phrmaProvider.getData(
    new MetricQuery(
      metricIds,
      baseBreakdown.addBreakdown(demographicType),
      undefined
    )
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  const consumedDatasetIds = [PhrmaDatasetId]
  consumedDatasetIds.push(...acsDatasetIds)

  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], consumedDatasetIds)
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
      'phrma_data-race_and_ethnicity_national',
      Breakdowns.forFips(new Fips('00')),
      RACE
    )
  })

  test('State and LIS Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'phrma_data-lis_state',
      Breakdowns.forFips(new Fips('02')),
      'lis'
    )
  })

  test('County and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'phrma_data-age_county-02',
      Breakdowns.forFips(new Fips('02999')),
      AGE
    )
  })
})
