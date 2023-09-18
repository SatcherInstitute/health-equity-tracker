import { METRIC_CONFIG, MetricId } from '../../data/config/MetricConfig'
import { DemographicType } from '../../data/query/Breakdowns'
import { MetricQueryResponse } from '../../data/query/MetricQuery'
import { FieldRange } from '../../data/utils/DatasetTypes'
import {
  getSubPopulationPhrase,
  getTotalACSPopulationPhrase,
} from './GeoContext'

describe('test getTotalACSPopulationPhrase()', () => {
  const nationalACSPopResponse: MetricQueryResponse = {
    data: [
      {
        population: 328016242,
        fips: '00',
        fips_name: 'United States',
      },
    ],
    invalidValues: {},
    consumedDatasetIds: [],
    missingDataMessage: undefined,
    dataIsMissing: function (): boolean {
      throw new Error('Function not implemented.')
    },
    isFieldMissing: function (fieldName: DemographicType | MetricId): boolean {
      throw new Error('Function not implemented.')
    },
    getFieldRange: function (fieldName: MetricId): FieldRange | undefined {
      throw new Error('Function not implemented.')
    },
    getValidRowsForField: function (
      fieldName: DemographicType | MetricId
    ): Readonly<Record<string, any>>[] {
      throw new Error('Function not implemented.')
    },
    getFieldValues: function (
      fieldName: DemographicType,
      targetMetric: MetricId
    ): { withData: string[]; noData: string[] } {
      throw new Error('Function not implemented.')
    },
    shouldShowMissingDataMessage: function (fields: MetricId[]): boolean {
      throw new Error('Function not implemented.')
    },
  }

  test('normal ACS population', () => {
    const normalPopPhrase = getTotalACSPopulationPhrase(
      /* MetricQueryResponse */ nationalACSPopResponse
    )
    expect(normalPopPhrase).toEqual('Total Population (US Census): 328,016,242')
  })
})

/*
TODO: Figure out how to test getSubPopulationPhrase() was having problems with the MetricQueryResponse methods
*/
