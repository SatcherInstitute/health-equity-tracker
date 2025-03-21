import type FakeDataFetcher from '../../testing/FakeDataFetcher'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import { type DatasetId, DatasetMetadataMap } from '../config/DatasetMetadata'
import {
  Breakdowns,
  type DemographicType,
  type TimeView,
} from '../query/Breakdowns'
import { MetricQuery } from '../query/MetricQuery'
import { AGE, RACE, SEX } from '../utils/Constants'
import { Fips } from '../utils/Fips'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import AcsConditionProvider from './AcsConditionProvider'
import { CHATAM, NC, USA } from './TestUtils'

async function ensureCorrectDatasetsDownloaded(
  acsDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
  timeView: TimeView,
) {
  const acsProvider = new AcsConditionProvider()
  const specificId = appendFipsIfNeeded(acsDatasetId, baseBreakdown)
  dataFetcher.setFakeDatasetLoaded(specificId, [])

  const responseIncludingAll = await acsProvider.getData(
    new MetricQuery(
      [],
      baseBreakdown.addBreakdown(demographicType),
      undefined,
      timeView,
    ),
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  expect(responseIncludingAll.consumedDatasetIds).toContain(acsDatasetId)
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('acsConditionProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('National and Sex Historical Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-sex_national_historical',
      Breakdowns.forFips(new Fips(USA.code)),
      SEX,
      'historical',
    )
  })

  test('National and Age Historical Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-age_national_historical',
      Breakdowns.forFips(new Fips(USA.code)),
      AGE,
      'historical',
    )
  })

  test('National and Race Historical Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-race_national_historical',
      Breakdowns.forFips(new Fips(USA.code)),
      RACE,
      'historical',
    )
  })

  test('State and Age Historical Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-age_state_historical',
      Breakdowns.forFips(new Fips(NC.code)),
      AGE,
      'historical',
    )
  })

  test('State and Sex Historical Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-sex_state_historical',
      Breakdowns.forFips(new Fips(NC.code)),
      SEX,
      'historical',
    )
  })

  test('State and Race Historical Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-race_state_historical',
      Breakdowns.forFips(new Fips(NC.code)),
      RACE,
      'historical',
    )
  })

  test('County and Age Historical Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-age_county_historical',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      AGE,
      'historical',
    )
  })

  test('County and Sex Historical Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-sex_county_historical',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      SEX,
      'historical',
    )
  })

  test('County and Race Historical Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-race_county_historical',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      RACE,
      'historical',
    )
  })

  test('National and Sex Current Year Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-sex_national_current',
      Breakdowns.forFips(new Fips(USA.code)),
      SEX,
      'current',
    )
  })

  test('National and Age Current Year Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-age_national_current',
      Breakdowns.forFips(new Fips(USA.code)),
      AGE,
      'current',
    )
  })

  test('National and Race Current Year Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-race_national_current',
      Breakdowns.forFips(new Fips(USA.code)),
      RACE,
      'current',
    )
  })

  test('State and Age Current Year Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-age_state_current',
      Breakdowns.forFips(new Fips(NC.code)),
      AGE,
      'current',
    )
  })

  test('State and Sex Current Year Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-sex_state_current',
      Breakdowns.forFips(new Fips(NC.code)),
      SEX,
      'current',
    )
  })

  test('State and Race Current Year Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-race_state_current',
      Breakdowns.forFips(new Fips(NC.code)),
      RACE,
      'current',
    )
  })

  test('County and Age Current Year Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-age_county_current',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      AGE,
      'current',
    )
  })

  test('County and Sex Current Year Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-sex_county_current',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      SEX,
      'current',
    )
  })

  test('County and Race Current Year Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'acs_condition-race_county_current',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      RACE,
      'current',
    )
  })
})
