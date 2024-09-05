import HivProvider from './HivProvider'
import {
  Breakdowns,
  type DemographicType,
  type TimeView,
} from '../query/Breakdowns'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { Fips } from '../utils/Fips'
import { type DatasetId, DatasetMetadataMap } from '../config/DatasetMetadata'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import type FakeDataFetcher from '../../testing/FakeDataFetcher'
import { RACE, AGE, SEX } from '../utils/Constants'
import type { DataTypeId } from '../config/MetricConfig'
import { appendFipsIfNeeded } from '../utils/datasetutils'

describe('Unit tests for method getDatasetId()', () => {
  const hivProvider = new HivProvider()

  test('Black women nationally historical', async () => {
    const breakdowns = new Breakdowns('national').andAge()
    expect(
      hivProvider.getDatasetId(
        breakdowns,
        'hiv_deaths_black_women',
        'historical',
      ),
    ).toEqual('cdc_hiv_data-black_women_national_historical')
  })

  test('Race nationally current year', async () => {
    const breakdowns = new Breakdowns('national').andRace()
    expect(hivProvider.getDatasetId(breakdowns, undefined, 'current')).toEqual(
      'cdc_hiv_data-race_and_ethnicity_national_current-with_age_adjust',
    )
  })

  test('Sex nationally, current', async () => {
    const breakdowns = new Breakdowns('national').andSex()
    expect(hivProvider.getDatasetId(breakdowns, undefined, 'current')).toEqual(
      'cdc_hiv_data-sex_national_current',
    )
  })

  test('County race over time', async () => {
    const breakdowns = new Breakdowns(
      'county',
      undefined,
      new Fips('01001'),
    ).andRace()
    expect(
      hivProvider.getDatasetId(breakdowns, undefined, 'historical'),
    ).toEqual('cdc_hiv_data-race_and_ethnicity_county_historical')
  })
})

async function ensureCorrectDatasetsDownloaded(
  hivDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
  dataTypeId: DataTypeId,
  timeView: TimeView,
) {
  const hivProvider = new HivProvider()
  const specificId = appendFipsIfNeeded(hivDatasetId, baseBreakdown)
  dataFetcher.setFakeDatasetLoaded(specificId, [])

  // Evaluate the response with requesting "All" field
  const responseIncludingAll = await hivProvider.getData(
    new MetricQuery(
      [],
      baseBreakdown.addBreakdown(demographicType),
      dataTypeId,
      timeView,
    ),
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  const consumedDatasetIds = [hivDatasetId]

  expect(responseIncludingAll).toEqual(
    new MetricQueryResponse([], consumedDatasetIds),
  )
}

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

interface TestCase {
  name: string
  datasetId: DatasetId
  breakdowns: Breakdowns
  demographicType: DemographicType
  dataTypeId: DataTypeId
  timeView: TimeView
}

const testCases: TestCase[] = [
  {
    name: 'County and Sex Breakdown for PrEP',
    datasetId: 'cdc_hiv_data-sex_county_historical',
    breakdowns: Breakdowns.forFips(new Fips('06037')),
    demographicType: SEX,
    dataTypeId: 'hiv_prep',
    timeView: 'historical',
  },
  {
    name: 'State and Race Breakdown Deaths',
    datasetId: 'cdc_hiv_data-race_and_ethnicity_state_historical',
    breakdowns: Breakdowns.forFips(new Fips('37')),
    demographicType: RACE,
    dataTypeId: 'hiv_deaths',
    timeView: 'historical',
  },
  {
    name: 'State and Age Breakdown PrEP',
    datasetId: 'cdc_hiv_data-age_state_historical',
    breakdowns: Breakdowns.forFips(new Fips('37')),
    demographicType: AGE,
    dataTypeId: 'hiv_prep',
    timeView: 'historical',
  },
  {
    name: 'State and Sex Breakdown Diagnoses',
    datasetId: 'cdc_hiv_data-sex_state_historical',
    breakdowns: Breakdowns.forFips(new Fips('37')),
    demographicType: SEX,
    dataTypeId: 'hiv_diagnoses',
    timeView: 'historical',
  },
]

describe('HivProvider Integration Tests', () => {
  beforeEach(() => {
    resetCacheDebug()
    dataFetcher.resetState()
    dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
  })

  testCases.forEach((testCase) => {
    test(testCase.name, async () => {
      await ensureCorrectDatasetsDownloaded(
        testCase.datasetId,
        testCase.breakdowns,
        testCase.demographicType,
        testCase.dataTypeId,
        testCase.timeView,
      )
    })
  })
})
