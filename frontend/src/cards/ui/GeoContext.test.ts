import { MetricId } from '../../data/config/MetricConfig'
import { DemographicType } from '../../data/query/Breakdowns'
import { MetricQueryResponse } from '../../data/query/MetricQuery'
import { FieldRange } from '../../data/utils/DatasetTypes'
import { getPopulationPhrase } from './GeoContext'

describe('test getPopulationPhrase()', () => {
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
    const normalPopPhrase = getPopulationPhrase(
      /* MetricQueryResponse */ nationalACSPopResponse,
      /* DemographicType */ 'race_and_ethnicity',
      /* MetricId */ 'population'
    )

    expect(normalPopPhrase).toEqual('Total Population: 328,016,242')
  })

  const nationalPhrmaResponse: MetricQueryResponse = {
    data: [
      {
        statins_adherence_estimated_total: 11941945,
        statins_beneficiaries_estimated_total: 14315816,
        phrma_population: 41816007,
        statins_adherence_pct_rate: 83,
        race_and_ethnicity: 'All',
        fips: '00',
        fips_name: 'United States',
      },
      {
        statins_adherence_estimated_total: 35590,
        statins_beneficiaries_estimated_total: 50849,
        phrma_population: 216860,
        statins_adherence_pct_rate: 70,
        race_and_ethnicity: 'American Indian and Alaska Native (NH)',
        fips: '00',
        fips_name: 'United States',
      },
      {
        statins_adherence_estimated_total: 407319,
        statins_beneficiaries_estimated_total: 489956,
        phrma_population: 1209171,
        statins_adherence_pct_rate: 83,
        race_and_ethnicity: 'Asian, Native Hawaiian, and Pacific Islander (NH)',
        fips: '00',
        fips_name: 'United States',
      },
      {
        statins_adherence_estimated_total: 1029854,
        statins_beneficiaries_estimated_total: 1367755,
        phrma_population: 4330893,
        statins_adherence_pct_rate: 75,
        race_and_ethnicity: 'Black or African American (NH)',
        fips: '00',
        fips_name: 'United States',
      },
      {
        statins_adherence_estimated_total: 809610,
        statins_beneficiaries_estimated_total: 1045617,
        phrma_population: 2987102,
        statins_adherence_pct_rate: 77,
        race_and_ethnicity: 'Hispanic or Latino',
        fips: '00',
        fips_name: 'United States',
      },
      {
        statins_adherence_estimated_total: 93791,
        statins_beneficiaries_estimated_total: 112811,
        phrma_population: 332663,
        statins_adherence_pct_rate: 83,
        race_and_ethnicity: 'Two or more races & Unrepresented race (NH)',
        fips: '00',
        fips_name: 'United States',
      },
      {
        statins_adherence_estimated_total: 9344843,
        statins_beneficiaries_estimated_total: 10992016,
        phrma_population: 32003930,
        statins_adherence_pct_rate: 85,
        race_and_ethnicity: 'White (NH)',
        fips: '00',
        fips_name: 'United States',
      },
    ],
    invalidValues: {},
    consumedDatasetIds: ['phrma_data-race_and_ethnicity_national'],
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
    missingDataMessage: '',
  }

  test('phrma medicare subpopulation', () => {
    const normalPopPhrase = getPopulationPhrase(
      /* MetricQueryResponse */ nationalPhrmaResponse,
      /* DemographicType */ 'race_and_ethnicity',
      /* MetricId */ 'arv_adherence_pct_rate'
    )

    expect(normalPopPhrase).toEqual('Total Medicare Population: 41,816,007')
  })
})
