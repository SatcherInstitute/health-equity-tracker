import { RACE } from '../utils/Constants'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import {
  autoInitGlobals,
  getDataFetcher,
  resetCacheDebug,
} from '../../utils/globals'
import { Breakdowns, DemographicType, TimeView } from '../query/Breakdowns'
import { DatasetId, DatasetMetadataMap } from '../config/DatasetMetadata'
import { DataTypeId } from '../config/MetricConfig'
import { Fips } from '../utils/Fips'
import { MetricId } from '../config/MetricConfig'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import FakeDataFetcher from '../../testing/FakeDataFetcher'
import GunViolenceYouthProvider from './GunViolenceYouthProvider'

export async function ensureCorrectDatasetsDownloaded(
    gunViolenceDatasetId: DatasetId,
    baseBreakdown: Breakdowns,
    demographicType: DemographicType,
    dataTypeId?: DataTypeId,
    timeView?: TimeView,
    metricIds?: MetricId[]
  ) {
    // If these aren't sent as args, default to []
    metricIds = metricIds || []
  
    const gunViolenceYouthProvider = new GunViolenceYouthProvider()
    const specificDatasetId = appendFipsIfNeeded(
      gunViolenceDatasetId,
      baseBreakdown
    )
    dataFetcher.setFakeDatasetLoaded(specificDatasetId, [])
  
    // Evaluate the response by requesting "All" field
    const responseIncludingAll = await gunViolenceYouthProvider.getData(
      new MetricQuery(
        metricIds,
        baseBreakdown.addBreakdown(demographicType),
        dataTypeId,
        timeView
      )
    )
  
    expect(dataFetcher.getNumLoadDatasetCalls()).toBe(1)
  
    const consumedDatasetIds = [gunViolenceDatasetId]
  
    expect(responseIncludingAll).toEqual(
      new MetricQueryResponse([], consumedDatasetIds)
    )
  }

autoInitGlobals()
const dataFetcher = getDataFetcher() as FakeDataFetcher

describe('GunViolenceYouthProvider', () => {
    beforeEach(() => {
        resetCacheDebug()
        dataFetcher.resetState()
        dataFetcher.setFakeMetadataLoaded(DatasetMetadataMap)
    })

    test('Historical National and Age Breakdown', async () => {
        await ensureCorrectDatasetsDownloaded(
            'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_national_historical', 
            Breakdowns.forFips(new Fips('00')), 
            RACE, 
            'gun_violence_youth', 
            'historical'
        )
    })

    test('Current State and Race Breakdown', async () => {
        await ensureCorrectDatasetsDownloaded(
            'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_state_current', 
            Breakdowns.forFips(new Fips('01')), 
            RACE, 
            'gun_violence_youth', 
            'current'
        )
    })
})