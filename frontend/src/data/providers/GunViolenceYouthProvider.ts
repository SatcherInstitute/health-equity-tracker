import { MetricId } from "../config/MetricConfig";
import { getDataManager } from '../../utils/globals';
import { type Breakdowns, type TimeView } from '../query/Breakdowns'
import { type DatasetId } from "../config/DatasetMetadata";
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery';
import VariableProvider from './VariableProvider';


export const GUN_VIOLENCE_YOUTH_METRICS: MetricId[] = [
    'gun_deaths_youth_estimated_total',
    'gun_deaths_youth_pct_relative_inequity',
    'gun_deaths_youth_pct_share',
    'gun_deaths_youth_per_100k',
    'gun_deaths_youth_population',
    'gun_deaths_youth_population_pct',
]

export const GUN_VIOLENCE_YOUTH_RESTRICTED_DEMOGRAPHIC_DETAILS = [
    ['Age', 'unavailable for Gun Deaths (Youth)'],
    ['Sex', 'unavailable for Gun Deaths (Youth)'],
]

class GunViolenceYouthProvider extends VariableProvider {
    constructor() {
        super('gun_violence_youth_provider', GUN_VIOLENCE_YOUTH_METRICS)
    }

    getDatasetId(breakdowns: Breakdowns, timeView?: TimeView): DatasetId | undefined {
        if (timeView === 'current') {
            if (breakdowns.hasOnlyRace()) {
                if (breakdowns.geography == 'national')
                    return 'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_national_current'
                if (breakdowns.geography == 'state')
                    return 'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_state_current'
            }
        }

        if (timeView === 'historical') {
            if (breakdowns.hasOnlyRace()) {
                if (breakdowns.geography == 'national')
                    return 'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_national_historical'
                if (breakdowns.geography == 'state')
                    return 'cdc_wisqars_youth_data-youth_by_race_and_ethnicity_state_historical'
            }
        }
    }

    async getDataInternal(metricQuery: MetricQuery): Promise<MetricQueryResponse> {
        try {
            const { breakdowns, timeView } = metricQuery
            console.log(breakdowns)
            const datasetId = this.getDatasetId(breakdowns, timeView)

            if (!datasetId) {
                throw new Error('DatasetId is undefined.')
            }

            const gunViolenceYouthData = await getDataManager().loadDataset(datasetId)
            let df = gunViolenceYouthData.toDataFrame()

            df = this.filterByGeo(df, breakdowns)
            df = this.renameGeoColumns(df, breakdowns)
            df = this.applyDemographicBreakdownFilters(df, breakdowns)
            df = this.removeUnrequestedColumns(df, metricQuery)

            const consumedDatasetIds = [datasetId]
            return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
        } catch (error) {
            console.error('Error fetching gun violence data:', error)
            throw error
        }
    }

    allowsBreakdowns(breakdowns: Breakdowns, metricIds: MetricId[]): boolean {
        const validDemographicBreakdownRequest = breakdowns.hasExactlyOneDemographic()

        return (breakdowns.geography === 'state' || breakdowns.geography === 'national') && validDemographicBreakdownRequest

    }
}

export default GunViolenceYouthProvider