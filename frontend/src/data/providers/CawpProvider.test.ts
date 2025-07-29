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
import {
  HISPANIC,
  RACE,
  type RaceAndEthnicityGroup,
  UNKNOWN_RACE,
  WHITE,
} from '../utils/Constants'
import { Fips } from '../utils/Fips'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import CawpProvider, { getWomenRaceLabel } from './CawpProvider'

async function ensureCorrectDatasetsDownloaded(
  cawpDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
  cardId?: ScrollableHashId,
  isFallback?: boolean,
) {
  const cawpProvider = new CawpProvider()
  const specificId = isFallback
    ? cawpDatasetId
    : appendFipsIfNeeded(cawpDatasetId, baseBreakdown)
  dataFetcher.setFakeDatasetLoaded(specificId, [])

  // Evaluate the response with requesting demographic breakdown
  const response = await cawpProvider.getData(
    new MetricQuery(
      ['pct_share_of_us_congress'],
      baseBreakdown.addBreakdown(demographicType),
      'women_in_us_congress',
      'current',
      cardId,
    ),
  )
  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  const consumedDatasetIds: Array<DatasetId | DatasetIdWithStateFIPSCode> = [
    cawpDatasetId,
    'the_unitedstates_project',
  ]
  expect(response).toEqual(new MetricQueryResponse([], consumedDatasetIds))
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('CAWP Unit Tests', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('Test Women Race Label Swapping', async () => {
    expect(getWomenRaceLabel(UNKNOWN_RACE)).toEqual('Women with unknown race')
    expect(getWomenRaceLabel(WHITE)).toEqual('White women')
    expect(
      getWomenRaceLabel('almost_anything' as RaceAndEthnicityGroup),
    ).toEqual('almost_anything women')
    expect(getWomenRaceLabel(HISPANIC)).not.toEqual('Hispanic and Latino women')
  })

  test('National and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cawp_data-race_and_ethnicity_national_current',
      Breakdowns.forFips(new Fips('00')),
      RACE,
    )
  })

  test('State and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cawp_data-race_and_ethnicity_state_current',
      Breakdowns.forFips(new Fips('37')),
      RACE,
    )
  })

  test('State with Different FIPS and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cawp_data-race_and_ethnicity_state_current',
      Breakdowns.forFips(new Fips('06')),
      RACE,
    )
  })

  test('National Race Breakdown with Specific Card ID', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cawp_data-race_and_ethnicity_national_current',
      Breakdowns.forFips(new Fips('00')),
      RACE,
      'rate-map',
    )
  })
})
