import { getDataManager } from '../../utils/globals';
import { type Breakdowns } from '../query/Breakdowns';
import { type MetricQuery, MetricQueryResponse } from '../query/MetricQuery';
import VariableProvider from './VariableProvider';
import { appendFipsIfNeeded } from '../utils/datasetutils';
import { type DatasetId } from '../config/DatasetMetadata';
import DataFrame from 'dataframe-js';

class MaternalMortalityProvider extends VariableProvider {
 constructor() {
  super('maternal_mortality_provider', [
   'maternal_mortality_per_100k',
   'maternal_mortality_estimated_total',
   'maternal_deaths_raw',
   'live_births_raw',
   'mm_pct_share',
   'mm_pct_relative_inequity',
  ]);
 }

 getDatasetId(breakdowns: Breakdowns): DatasetId | undefined {
  if (breakdowns.hasOnlyRace()) {
   if (breakdowns.geography === 'state') return 'maternal_mortality_state_by_race';
   if (breakdowns.geography === 'national') return 'maternal_mortality_national_by_race';
  }
  if (breakdowns.hasOnlyAge()) {
   if (breakdowns.geography === 'state') return 'maternal_mortality_state_by_age';
   if (breakdowns.geography === 'national') return 'maternal_mortality_national_by_age';
  }
  if (breakdowns.hasOnlySex()) {
   if (breakdowns.geography === 'state') return 'maternal_mortality_state_by_sex';
   if (breakdowns.geography === 'national') return 'maternal_mortality_national_by_sex';
  }
  return undefined;
 }

 async getDataInternal(metricQuery: MetricQuery): Promise<MetricQueryResponse> {
  const breakdowns = metricQuery.breakdowns;
  const datasetId = this.getDatasetId(breakdowns);
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

 filterByGeo(df: DataFrame, breakdowns: Breakdowns): DataFrame {
  if (breakdowns.geography === 'state' && breakdowns.filterFips) {
   return df.filter(row => breakdowns.filterFips.includes(row.get('state_fips')));
  }
  if (breakdowns.geography === 'county' && breakdowns.filterFips) {
   return df.filter(row => breakdowns.filterFips.includes(row.get('county_fips')));
  }
  return df;
 }

 renameGeoColumns(df: DataFrame, breakdowns: Breakdowns): DataFrame {
  if (breakdowns.geography === 'state') {
   return df.rename('state_name', 'geo');
  }
  if (breakdowns.geography === 'county') {
   return df.rename('county_name', 'geo');
  }
  return df.rename('national', 'geo');
 }

 applyDemographicBreakdownFilters(df: DataFrame, breakdowns: Breakdowns): DataFrame {
  if (breakdowns.hasOnlyRace()) {
   return df.filter(row => row.get('race') === breakdowns.race);
  }
  if (breakdowns.hasOnlyAge()) {
   return df.filter(row => row.get('age') === breakdowns.age);
  }
  if (breakdowns.hasOnlySex()) {
   return df.filter(row => row.get('sex') === breakdowns.sex);
  }
  return df;
 }

 removeUnrequestedColumns(df: DataFrame, metricQuery: MetricQuery): DataFrame {
  const requestedMetrics = metricQuery.metrics;
  const allColumns = df.listColumns();
  const columnsToKeep = requestedMetrics.concat(['geo', 'time_period', 'race', 'age', 'sex']);
  const columnsToRemove = allColumns.filter(col => !columnsToKeep.includes(col));
  return df.drop(...columnsToRemove);
 }
}

export default MaternalMortalityProvider;
