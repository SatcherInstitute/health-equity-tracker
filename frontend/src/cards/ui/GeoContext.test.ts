import { DataTypeConfig, METRIC_CONFIG } from '../../data/config/MetricConfig'
import { Row } from '../../data/utils/DatasetTypes'
import {
  getSubPopulationPhrase,
  getTotalACSPopulationPhrase,
} from './GeoContext'

describe('test getTotalACSPopulationPhrase()', () => {
  const nationalACSPopData: Row[] = [
    {
      population: 328016242,
      fips: '00',
      fips_name: 'United States',
    },
  ]

  test('normal ACS population', () => {
    const normalPopPhrase = getTotalACSPopulationPhrase(
      /* data */ nationalACSPopData
    )
    expect(normalPopPhrase).toEqual('Total Population (US Census): 328,016,242')
  })
})

describe('test getSubPopulationPhrase()', () => {
  const nationalPhrmaData: Row[] = [
    {
<<<<<<< HEAD
      medicare_population: 41816007,
=======
      phrma_population: 41816007,
>>>>>>> c22929f2 (Adds SubPopulation Breadcrumb (#2383))
      race_and_ethnicity: 'All',
      fips: '00',
      fips_name: 'United States',
    },
    {
<<<<<<< HEAD
      medicare_population: 216860,
=======
      phrma_population: 216860,
>>>>>>> c22929f2 (Adds SubPopulation Breadcrumb (#2383))
      race_and_ethnicity: 'American Indian and Alaska Native (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
<<<<<<< HEAD
      medicare_population: 1209171,
=======
      phrma_population: 1209171,
>>>>>>> c22929f2 (Adds SubPopulation Breadcrumb (#2383))
      race_and_ethnicity: 'Asian, Native Hawaiian, and Pacific Islander (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
<<<<<<< HEAD
      medicare_population: 4330893,
=======
      phrma_population: 4330893,
>>>>>>> c22929f2 (Adds SubPopulation Breadcrumb (#2383))
      race_and_ethnicity: 'Black or African American (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
<<<<<<< HEAD
      medicare_population: 2987102,
=======
      phrma_population: 2987102,
>>>>>>> c22929f2 (Adds SubPopulation Breadcrumb (#2383))
      race_and_ethnicity: 'Hispanic or Latino',
      fips: '00',
      fips_name: 'United States',
    },
    {
<<<<<<< HEAD
      medicare_population: 332663,
=======
      phrma_population: 332663,
>>>>>>> c22929f2 (Adds SubPopulation Breadcrumb (#2383))
      race_and_ethnicity: 'Two or more races & Unrepresented race (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
<<<<<<< HEAD
      medicare_population: 32003930,
=======
      phrma_population: 32003930,
>>>>>>> c22929f2 (Adds SubPopulation Breadcrumb (#2383))
      race_and_ethnicity: 'White (NH)',
      fips: '00',
      fips_name: 'United States',
    },
  ]
  const statinsAdherenceConfig: DataTypeConfig =
    METRIC_CONFIG.phrma_cardiovascular[0]

  test('phrma medicare national population', () => {
    const medicarePopPhrase = getSubPopulationPhrase(
      /* data */ nationalPhrmaData,
      /* demographicType */ 'race_and_ethnicity',
      /* dataTypeConfig */ statinsAdherenceConfig
    )
    expect(medicarePopPhrase).toEqual('Total Medicare Population: 41,816,007')
  })

  const countyPhrmaData: Row[] = [
    {
<<<<<<< HEAD
      medicare_population: null,
=======
      phrma_population: null,
>>>>>>> c22929f2 (Adds SubPopulation Breadcrumb (#2383))
      some_metric_: 50.0,
      sex: 'All',
      fips: '99999',
      fips_name: 'Some County',
    },
    {
<<<<<<< HEAD
      medicare_population: null,
=======
      phrma_population: null,
>>>>>>> c22929f2 (Adds SubPopulation Breadcrumb (#2383))
      some_metric_: 50.0,
      sex: 'Male',
      fips: '99999',
      fips_name: 'Some County',
    },
    {
<<<<<<< HEAD
      medicare_population: null,
=======
      phrma_population: null,
>>>>>>> c22929f2 (Adds SubPopulation Breadcrumb (#2383))
      some_metric_: 50.0,
      sex: 'Female',
      fips: '99999',
      fips_name: 'Some County',
    },
  ]

  test('phrma medicare metric expects extra subpop breadcrumb, but pop data is unavailable', () => {
    const medicarePopPhrase = getSubPopulationPhrase(
      /* data */ countyPhrmaData,
      /* demographicType */ 'sex',
      /* dataTypeConfig */ statinsAdherenceConfig
    )
    expect(medicarePopPhrase).toEqual('Total Medicare Population: unavailable')
  })

  const nationalCovidData: Row[] = [
    {
      covid_estimated_total: 41816007,
      race_and_ethnicity: 'All',
      fips: '00',
      fips_name: 'United States',
    },
    {
      covid_estimated_total: 216860,
      race_and_ethnicity: 'American Indian and Alaska Native (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
      covid_estimated_total: 1209171,
      race_and_ethnicity: 'Asian, Native Hawaiian, and Pacific Islander (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
      covid_estimated_total: 4330893,
      race_and_ethnicity: 'Black or African American (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
      covid_estimated_total: 2987102,
      race_and_ethnicity: 'Hispanic or Latino',
      fips: '00',
      fips_name: 'United States',
    },
    {
      covid_estimated_total: 332663,
      race_and_ethnicity: 'Two or more races & Unrepresented race (NH)',
      fips: '00',
      fips_name: 'United States',
    },
    {
      covid_estimated_total: 32003930,
      race_and_ethnicity: 'White (NH)',
      fips: '00',
      fips_name: 'United States',
    },
  ]

  const covidCasesConfig: DataTypeConfig = METRIC_CONFIG.covid[0]

  test('covid should not get a subpopulation', () => {
    const emptyCovidSubPopPhrase = getSubPopulationPhrase(
      /* data */ nationalCovidData,
      /* demographicType */ 'race_and_ethnicity',
      /* dataTypeConfig */ covidCasesConfig
    )
    expect(emptyCovidSubPopPhrase).toEqual('')
  })
})
