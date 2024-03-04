import { getDataManager } from '../../utils/globals'
import { type DatasetId } from '../config/DatasetMetadata'
import { type DataTypeId, type MetricId } from '../config/MetricConfig'
import { type TimeView, Breakdowns } from '../query/Breakdowns'
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery'
import { appendFipsIfNeeded } from '../utils/datasetutils'
import VariableProvider from './VariableProvider'

export const GUN_VIOLENCE_DATATYPES: DataTypeId[] = [
    'gun_violence_homicide',
    'gun_violence_legal_intervention',
    'gun_violence_suicide',
    'gun_violence_injuries'
]

export const GUN_VIOLENCE_METRICS: MetricId[] = [
    'gun_violence_homicide_per_100k',
    'gun_violence_homicide_pct_share',
    'gun_violence_homicide_pct_relative_inequity',
    'gun_violence_legal_intervention_per_100k',
    'gun_violence_legal_intervention_pct_share',
    'gun_violence_legal_intervention_pct_relative_inequity',
    'gun_violence_suicide_per_100k',
    'gun_violence_suicide_pct_share',
    'gun_violence_suicide_pct_relative_inequity',
    'gun_violence_injuries_per_100k',
    'gun_violence_injuries_pct_share',
    'gun_violence_injuries_pct_relative_inequity'
]

export const GUN_VIOLENCE_DETERMINANTS = [
    ...GUN_VIOLENCE_METRICS
]

class GunViolenceProvider extends VariableProvider {
    constructor() {
        super('gun_violence_provider', GUN_VIOLENCE_DETERMINANTS)
    }

    getDatasetId(
        breakdowns: Breakdowns,
        dataTypeId?: DataTypeId,
        timeView?: TimeView
    ): DatasetId | undefined {
        if (timeView === 'historical') {
            if (breakdowns.hasOnlyAge()) {
                if (breakdowns.geography === 'state')
                    return 'cdc_wisqars_data-age_state_historical'
                if (breakdowns.geography === 'national')
                    return 'cdc_wisqars_data-age_national_historical'
            }
            if (breakdowns.hasOnlyRace()) {
                if (breakdowns.geography === 'state')
                    return 'cdc_wisqars_data-race_and_ethnicity_state_historical'
                if (breakdowns.geography === 'national')
                    return 'cdc_wisqars_data-race_and_ethnicity_national_historical'
            }
            if (breakdowns.hasOnlySex()) {
                if (breakdowns.geography === 'state')
                    return 'cdc_wisqars_data-sex_state_historical'
                if (breakdowns.geography === 'national')
                    return 'cdc_wisqars_data-sex_national_historical'
            }
        }

        if (timeView === 'current') {
            if (breakdowns.hasOnlyAge()) {
                if (breakdowns.geography === 'state')
                    return 'cdc_wisqars_data-age_state_current'
                if (breakdowns.geography === 'national')
                    return 'cdc_wisqars_data-age_national_current'
            }
            if (breakdowns.hasOnlyRace()) {
                if (breakdowns.geography === 'state')
                    return 'cdc_wisqars_data-race_and_ethnicity_state_current'
                if (breakdowns.geography === 'national')
                    return 'cdc_wisqars_data-race_and_ethnicity_national_current'
            }
            if (breakdowns.hasOnlySex()) {
                if (breakdowns.geography === 'state')
                    return 'cdc_wisqars_data-sex_state_current'
                if (breakdowns.geography === 'national')
                    return 'cdc_wisqars_data-sex_national_current'
            }
        }
    }

    async getDataInternal(metricQuery: MetricQuery): Promise<MetricQueryResponse> {
        const breakdowns = metricQuery.breakdowns
        const timeView = metricQuery.timeView
        const datasetId = this.getDatasetId(breakdowns, metricQuery.dataTypeId, timeView)
        if (!datasetId) throw Error('DatasetId undefined')
        const specificDatasetId = appendFipsIfNeeded(datasetId, breakdowns)
        const gunViolence = await getDataManager().loadDataset(specificDatasetId)
        let df = gunViolence.toDataFrame()

        df = this.filterByGeo(df, breakdowns)
        df = this.renameGeoColumns(df, breakdowns)

        const consumedDatasetIds = [datasetId]

        df = this.applyDemographicBreakdownFilters(df, breakdowns)
        df = this.removeUnrequestedColumns(df, metricQuery)

        return new MetricQueryResponse(df.toArray(), consumedDatasetIds)
    }

    allowsBreakdowns(breakdowns: Breakdowns, metricIds: MetricId[]): boolean {
        const validDemographicBreakdownRequest = breakdowns.hasExactlyOneDemographic()
        return (breakdowns.geography === 'state' || breakdowns.geography === 'national') && validDemographicBreakdownRequest

    }
}

export default GunViolenceProvider