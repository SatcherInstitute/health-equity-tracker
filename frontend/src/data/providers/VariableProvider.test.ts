import { DataFrame } from 'data-forge'
import VariableProvider from "./VariableProvider";
import { Breakdowns, TimeView } from '../query/Breakdowns';
import { Fips } from '../utils/Fips';
import { MetricId } from '../config/MetricConfig';
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery';


// Mock VariableProvider class for testing
class MockVariableProvider extends VariableProvider {
    getDataInternal(metricQuery: MetricQuery): Promise<MetricQueryResponse> {
        throw new Error('Method not implemented.');
    }
    allowsBreakdowns(breakdowns: Breakdowns, metricIds?: MetricId[] | undefined): boolean {
        throw new Error('Method not implemented.');
    }
    getDatasetId(breakdown: Breakdowns, dataType?: string | undefined, timeView?: TimeView | undefined, dataTypeId?: string | undefined): string {
        throw new Error('Method not implemented.');
    }
}

describe('VariableProvider', () => {
  test('filterByGeo', async () => {
    const mockDataFrame = new DataFrame([
        { county_fips: '45001', state_fips: '45', hiv_prevalence_per_100k: 10 },
        { county_fips: '67890', state_fips: '89', hiv_prevalence_per_100k: 20 },
      ])

      const mockBreakdowns = new Breakdowns(
        'county', 
        {
            age: {columnName: 'age', enabled: false, filter: undefined}, 
            eligibility: {columnName: 'eligibility', enabled: false, filter: undefined},
            lis: {columnName: 'lis', enabled: false, filter: undefined}, 
            race_and_ethnicity: {columnName: 'race_and_ethnicity', enabled: true, filter: undefined},
            sex: {columnName: 'sex', enabled: false, filter: undefined}
        }, 
        true, 
        new Fips('45001'))

    const variableProvider = new MockVariableProvider('hiv_provider', ['hiv_prevalence_per_100k'])

    const filteredDataFrame = variableProvider.filterByGeo(mockDataFrame, mockBreakdowns)

    expect(filteredDataFrame.toArray()).toEqual([
      { county_fips: '45001', state_fips: '45', hiv_prevalence_per_100k: 10 },
    ])
  })
})
