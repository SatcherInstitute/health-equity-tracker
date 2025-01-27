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
import { Fips } from '../utils/Fips'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import { MARIN, NC, USA } from './TestUtils'
import VaccineProvider from './VaccineProvider'

async function ensureCorrectDatasetsDownloaded(
  vaccinationDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
) {
  const vaccineProvider = new VaccineProvider()
  const specificDatasetId = appendFipsIfNeeded(
    vaccinationDatasetId,
    baseBreakdown,
  )
  dataFetcher.setFakeDatasetLoaded(specificDatasetId, [])

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await vaccineProvider.getData(
    new MetricQuery([], baseBreakdown.addBreakdown(demographicType)),
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)
  expect(responseIncludingAll.consumedDatasetIds).toContain(
    vaccinationDatasetId,
  )
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('VaccineProvider', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  test('State and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'kff_vaccination-race_and_ethnicity_state_current',
      Breakdowns.forFips(new Fips(NC.code)),
      RACE,
    )
  })

  test('National and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_vaccination_national-race_national_current',
      Breakdowns.forFips(new Fips(USA.code)),
      RACE,
    )
  })

  test('National and Sex Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_vaccination_national-sex_national_current',
      Breakdowns.forFips(new Fips(USA.code)),
      SEX,
    )
  })

  test('National and Age Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_vaccination_national-age_national_current',
      Breakdowns.forFips(new Fips(USA.code)),
      AGE,
    )
  })

  test('County and Race Breakdown', async () => {
    await ensureCorrectDatasetsDownloaded(
      'cdc_vaccination_county-alls_county_current',
      Breakdowns.forFips(new Fips(MARIN.code)),
      RACE,
    )
  })
})
