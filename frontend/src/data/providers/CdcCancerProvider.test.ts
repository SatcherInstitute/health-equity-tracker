import type FakeDataFetcher from '../../testing/FakeDataFetcher'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import { type DatasetId, DatasetMetadataMap } from '../config/DatasetMetadata'
import type { DataTypeId } from '../config/MetricConfigTypes'
import {
  Breakdowns,
  type DemographicType,
  type TimeView,
} from '../query/Breakdowns'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { RACE, SEX } from '../utils/Constants'
import { Fips } from '../utils/Fips'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import CdcCancerProvider from './CdcCancerProvider'

async function ensureCorrectDatasetsDownloaded(
  cancerDatasetId: DatasetId,
  baseBreakdown: Breakdowns,
  demographicType: DemographicType,
  dataTypeId: DataTypeId,
  timeView: TimeView,
) {
  const cdcCancerProvider = new CdcCancerProvider()
  const specificId = appendFipsIfNeeded(cancerDatasetId, baseBreakdown)
  dataFetcher.setFakeDatasetLoaded(specificId, [])

  const responseIncludingAll = await cdcCancerProvider.getData(
    new MetricQuery(
      [],
      baseBreakdown.addBreakdown(demographicType),
      dataTypeId,
      timeView,
    ),
  )

  expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)

  const consumedDatasetIds = [cancerDatasetId]

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
    name: 'National and Race Breakdown for Breast Cancer Historical',
    datasetId: 'cdc_wonder_data-race_and_ethnicity_national_historical',
    breakdowns: Breakdowns.forFips(new Fips('00')),
    demographicType: RACE,
    dataTypeId: 'breast_cancer_incidence',
    timeView: 'historical',
  },
  {
    name: 'National and Race Breakdown for Breast Cancer Current',
    datasetId: 'cdc_wonder_data-race_and_ethnicity_national_current',
    breakdowns: Breakdowns.forFips(new Fips('00')),
    demographicType: RACE,
    dataTypeId: 'breast_cancer_incidence',
    timeView: 'current',
  },
  {
    name: 'State and Race Breakdown for Lung Cancer Historical',
    datasetId: 'cdc_wonder_data-race_and_ethnicity_state_historical',
    breakdowns: Breakdowns.forFips(new Fips('06')),
    demographicType: RACE,
    dataTypeId: 'lung_cancer_incidence',
    timeView: 'historical',
  },
  {
    name: 'State and Race Breakdown for Lung Cancer Current',
    datasetId: 'cdc_wonder_data-race_and_ethnicity_state_current',
    breakdowns: Breakdowns.forFips(new Fips('06')),
    demographicType: RACE,
    dataTypeId: 'lung_cancer_incidence',
    timeView: 'current',
  },
  {
    name: 'National and Sex Breakdown for Colorectal Cancer Historical',
    datasetId: 'cdc_wonder_data-sex_national_historical',
    breakdowns: Breakdowns.forFips(new Fips('00')),
    demographicType: SEX,
    dataTypeId: 'colorectal_cancer_incidence',
    timeView: 'historical',
  },
  {
    name: 'National and Sex Breakdown for Colorectal Cancer Current',
    datasetId: 'cdc_wonder_data-sex_national_current',
    breakdowns: Breakdowns.forFips(new Fips('00')),
    demographicType: SEX,
    dataTypeId: 'colorectal_cancer_incidence',
    timeView: 'current',
  },
  {
    name: 'State and Sex Breakdown for Lung Cancer Historical',
    datasetId: 'cdc_wonder_data-sex_state_historical',
    breakdowns: Breakdowns.forFips(new Fips('37')),
    demographicType: SEX,
    dataTypeId: 'lung_cancer_incidence',
    timeView: 'historical',
  },
  {
    name: 'State and Sex Breakdown for Lung Cancer Current',
    datasetId: 'cdc_wonder_data-sex_state_current',
    breakdowns: Breakdowns.forFips(new Fips('37')),
    demographicType: SEX,
    dataTypeId: 'lung_cancer_incidence',
    timeView: 'current',
  },
]

describe('CdcCancerProvider Integration Tests', () => {
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
