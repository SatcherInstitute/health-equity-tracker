import { getDataManager } from '../../utils/globals';
import { TimeView, type Breakdowns } from '../query/Breakdowns';
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery';
import VariableProvider from './VariableProvider';
import { appendFipsIfNeeded } from '../utils/datasetutils';
import { type DatasetId } from '../config/DatasetMetadata';
import { DataTypeId } from '../config/MetricConfig';

class MaternalMortalityProvider extends VariableProvider {
  constructor() {
    super('maternal_mortality_provider', [
      'maternal_mortality_per_100k',
      'maternal_mortality_pct_share',
      'maternal_mortality_population_pct',
      'maternal_deaths_estimated_total',
      'live_births_estimated_total',
    ]);
  }


  getDatasetId(breakdowns: Breakdowns,
    dataTypeId?: DataTypeId,
    timeView?: TimeView): DatasetId | undefined {
    if (breakdowns.hasOnlyRace()) {
      if (timeView === 'current') {
        if (breakdowns.geography === 'state') return "maternal_mortality_data-by_race_state_current";
        if (breakdowns.geography === 'national') return 'maternal_mortality_data-by_race_national_current';
      }
      if (timeView === 'historical') {
        if (breakdowns.geography === 'state') return "maternal_mortality_data-by_race_state_historical";
        if (breakdowns.geography === 'national') return 'maternal_mortality_data-by_race_national_historical';
      }
    }
  }

  async getDataInternal(metricQuery: MetricQuery): Promise<MetricQueryResponse> {
    const breakdowns = metricQuery.breakdowns;
    const datasetId = this.getDatasetId(breakdowns, undefined, metricQuery.timeView);
    if (!datasetId) throw Error('DatasetId undefined');
    const specificDatasetId = appendFipsIfNeeded(datasetId, breakdowns);
    const maternalMortalityDataset = await getDataManager().loadDataset(specificDatasetId);
    const consumedDatasetIds = [datasetId];
    let df = maternalMortalityDataset.toDataFrame();

    // Filter by geography
    df = this.filterByGeo(df, breakdowns);

    if (df.toArray().length === 0) {
      return new MetricQueryResponse([], consumedDatasetIds);
    }
    df = this.renameGeoColumns(df, breakdowns);

    // Apply demographic breakdown filters
    df = this.applyDemographicBreakdownFilters(df, breakdowns);
    df = this.removeUnrequestedColumns(df, metricQuery);

    return new MetricQueryResponse(df.toArray(), consumedDatasetIds);
  }

  allowsBreakdowns(breakdowns: Breakdowns): boolean {
    return breakdowns.hasExactlyOneDemographic();
  }
}



export default MaternalMortalityProvider;
