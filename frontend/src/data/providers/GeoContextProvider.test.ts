import GeoContextProvider from './GeoContextProvider'
import { Breakdowns } from '../query/Breakdowns'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { Fips } from '../utils/Fips'
import { DatasetId, DatasetMetadataMap } from '../config/DatasetMetadata'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import FakeDataFetcher from '../../testing/FakeDataFetcher'
import { MetricId } from '../config/MetricConfig'
import { appendFipsIfNeeded } from '../utils/datasetutils'

/* Given the geocontext id */
export async function ensureCorrectDatasetsDownloaded(
  fips: Fips,
  metricIds: MetricId[],
  expectedGeoContextId: DatasetId,
  expectedDatasetIds: DatasetId[]
) {
  const breakdown = Breakdowns.forFips(fips)
  const provider = new GeoContextProvider()

  const specificId = appendFipsIfNeeded(expectedGeoContextId, breakdown)

  dataFetcher.setFakeDatasetLoaded(specificId, [])

  // Evaluate the response
  const responseIncludingAll = await provider.getData(
    new MetricQuery(metricIds, breakdown)
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], expectedDatasetIds)
  )
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('GeoContextProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('County Pop+SVI', async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips('06037'),
      ['svi', 'population'],
      'geo_context-county',
      ['geo_context-county', 'acs_population-by_sex_county']
    )
  })

  test('County SVI only', async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips('06037'),
      ['svi'],
      'geo_context-county',
      ['geo_context-county']
    )
  })

  test('County Equivalent ACS Pop+SVI', async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips('72123'),
      ['svi', 'population'],
      'geo_context-county',
      ['geo_context-county', 'acs_population-by_sex_county']
    )
  })

  test('County Equivalent Island Area Pop+SVI', async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips('78010'),
      ['svi', 'population'],
      'geo_context-county',
      [
        'geo_context-county',
        'decia_2020_territory_population-by_sex_territory_county_level',
      ]
    )
  })

  test('State Pop', async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips('06'),
      ['population'],
      'geo_context-state',
      ['acs_population-by_sex_state']
    )
  })

  test('Territory ACS Pop', async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips('72'),
      ['population'],
      'geo_context-state',
      ['acs_population-by_sex_state']
    )
  })

  test('Territory Island Area Pop', async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips('78'),
      ['population'],
      'geo_context-state',
      ['decia_2020_territory_population-by_sex_territory_state_level']
    )
  })

  test('National Pop', async () => {
    await ensureCorrectDatasetsDownloaded(
      new Fips('00'),
      ['population'],
      'geo_context-national',
      ['acs_population-by_sex_national']
    )
  })
})
