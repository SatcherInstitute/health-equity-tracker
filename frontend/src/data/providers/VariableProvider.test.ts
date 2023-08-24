import { DataFrame } from 'data-forge'
import VariableProvider from "./VariableProvider"
import { Breakdowns, TimeView } from '../query/Breakdowns'
import { Fips } from '../utils/Fips'
import { MetricId } from '../config/MetricConfig'
import { MetricQuery, MetricQueryResponse } from '../query/MetricQuery'


// Mock VariableProvider class for testing
class MockVariableProvider extends VariableProvider {
    getDataInternal(metricQuery: MetricQuery): Promise<MetricQueryResponse> {
        throw new Error('Method not implemented.')
    }
    allowsBreakdowns(breakdowns: Breakdowns, metricIds?: MetricId[] | undefined): boolean {
        throw new Error('Method not implemented.')
    }
    getDatasetId(breakdown: Breakdowns, dataType?: string | undefined, timeView?: TimeView | undefined, dataTypeId?: string | undefined): string {
        throw new Error('Method not implemented.')
    }
}

describe('VariableProvider', () => {
    test('getMostRecentYear', async () => {
        const mockDataFrame = new DataFrame([
            { time_period: '2019', pct_share_of_women_state_leg: 10 },
            { time_period: '2017', pct_share_of_women_us_congress: 20 },
        ])
        
        const variableProvider = new MockVariableProvider('cawp_provider', ['pct_share_of_women_us_congress'])
        const mostRecentYear = variableProvider.getMostRecentYear(mockDataFrame, ['pct_share_of_women_us_congress'])
        expect(mostRecentYear).toEqual('2017')
    })

    test('filterByGeo', async () => {
        const mockDataFrame = new DataFrame([
            { county_fips: '45001', state_fips: '45', hiv_prevalence_per_100k: 10 },
            { county_fips: '67890', state_fips: '89', hiv_prevalence_per_100k: 20 },
        ])
        
        const mockBreakdowns = new Breakdowns(
            'county',
            {
                age: { columnName: 'age', enabled: false },
                eligibility: { columnName: 'eligibility', enabled: false },
                lis: { columnName: 'lis', enabled: false },
                race_and_ethnicity: { columnName: 'race_and_ethnicity', enabled: true, filter: undefined },
                sex: { columnName: 'sex', enabled: false}
            },
            true,
            new Fips('45001'))

        const variableProvider = new MockVariableProvider('hiv_provider', ['hiv_prevalence_per_100k'])
        const filteredDataFrame = variableProvider.filterByGeo(mockDataFrame, mockBreakdowns)
        expect(filteredDataFrame.toArray()).toEqual([
            { county_fips: '45001', state_fips: '45', hiv_prevalence_per_100k: 10 },
        ])
    })

    test('filterByTimeView', async() => {
        const mockDataFrame = new DataFrame([
            { time_period: '2020', jail_per_100k: 10 },
            { time_period: '2021', jail_per_100k: 20 },
            { time_period: '2022', jail_per_100k: 15 },
          ])
          
          const mockTimeView = 'cross_sectional'
          const variableProvider = new MockVariableProvider('incarceration_provider', ['jail_per_100k'])
          const filteredDataFrame = variableProvider.filterByTimeView(mockDataFrame, mockTimeView, '2021')

          if (mockTimeView === 'cross_sectional') {
            expect(filteredDataFrame.toArray()).toEqual([
              { time_period: '2021', jail_per_100k: 20 },
            ])
          } else {
            expect(filteredDataFrame.toArray()).toEqual(mockDataFrame.toArray())
          }
        })
    
})
