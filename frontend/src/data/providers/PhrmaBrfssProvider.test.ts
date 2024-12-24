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
import { Fips } from '../utils/Fips'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import PhrmaBrfssProvider from './PhrmaBrfssProvider'

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

  const phrmaBrfssProvider = new PhrmaBrfssProvider()
  const specificDatasetId = appendFipsIfNeeded(PhrmaDatasetId, baseBreakdown)
  dataFetcher.setFakeDatasetLoaded(specificDatasetId, [])

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await phrmaBrfssProvider.getData(
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

describe('PhrmaBrfssProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('National and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'phrma_brfss_data-race_and_ethnicity_national',
      Breakdowns.forFips(new Fips('00')),
      'race_and_ethnicity',
    )
  })

  test('National and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'phrma_brfss_data-sex_national',
      Breakdowns.forFips(new Fips('00')),
      'sex',
    )
  })

  test('National and Education Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'phrma_brfss_data-education_national',
      Breakdowns.forFips(new Fips('00')),
      'education',
    )
  })

  test('State and Income Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'phrma_brfss_data-income_state',
      Breakdowns.forFips(new Fips('02')),
      'income',
    )
  })
})
