import type FakeDataFetcher from '../../testing/FakeDataFetcher'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import { type DatasetId, DatasetMetadataMap } from '../config/DatasetMetadata'
import { Breakdowns, type DemographicType } from '../query/Breakdowns'
import { MetricQuery } from '../query/MetricQuery'
import { AGE, RACE, SEX } from '../utils/Constants'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import { Fips } from '../utils/Fips'
import CdcCovidProvider from './CdcCovidProvider'
import { CHATAM, NC, USA, VI } from './TestUtils'

async function ensureCorrectDatasetsDownloaded(
  cdcDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
) {
  const cdcCovidProvider = new CdcCovidProvider()
  const specificId = appendFipsIfNeeded(cdcDatasetId, baseBreakdown)
  dataFetcher.setFakeDatasetLoaded(specificId, [])

  const responseIncludingAll = await cdcCovidProvider.getData(
    new MetricQuery(
      [],
      baseBreakdown.addBreakdown(demographicType),
      /* dataTypeId? */ 'covid_cases',
      /* timeView? */ 'current',
      /* ScrollableHashId? */ undefined,
    ),
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)
  expect(responseIncludingAll.consumedDatasetIds).toContain(cdcDatasetId)
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('cdcCovidProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('National and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-sex_national_cumulative',
      Breakdowns.forFips(new Fips(USA.code)),
      SEX,
    )
  })

  test('National and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-age_national_cumulative',
      Breakdowns.forFips(new Fips(USA.code)),
      AGE,
    )
  })

  test('National and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-race_and_ethnicity_national_cumulative-with_age_adjust',
      Breakdowns.forFips(new Fips(USA.code)),
      RACE,
    )
  })

  test('State and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-age_state_cumulative',
      Breakdowns.forFips(new Fips(NC.code)),
      AGE,
    )
  })

  test('State and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-sex_state_cumulative',
      Breakdowns.forFips(new Fips(NC.code)),
      SEX,
    )
  })

  test('State and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-race_and_ethnicity_state_cumulative-with_age_adjust',
      Breakdowns.forFips(new Fips(NC.code)),
      RACE,
    )
  })

  test('County and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-age_county_cumulative',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      AGE,
    )
  })

  test('County and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-sex_county_cumulative',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      SEX,
    )
  })

  test('County and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-race_and_ethnicity_county_cumulative',
      Breakdowns.forFips(new Fips(CHATAM.code)),
      RACE,
    )
  })

  test('population source acs 2020', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_restricted_data-sex_state_cumulative',
      Breakdowns.forFips(new Fips(VI.code)),
      SEX,
    )
  })
})
