import type { DatasetId } from '../config/DatasetMetadata'
import type { DataSourceId } from '../config/MetadataMap'
import { convertSpecialCharactersForCsv, Dataset } from './DatasetTypes'

describe('DatasetTypes', () => {
  test('Testing convertSpecialCharactersForCsv()', async () => {
    expect(convertSpecialCharactersForCsv('This, that, and the other')).toEqual(
      '"This, that, and the other"',
    )
    expect(convertSpecialCharactersForCsv('Other')).toEqual('Other')
    expect(convertSpecialCharactersForCsv(1)).toEqual(1)
    expect(convertSpecialCharactersForCsv(null)).toEqual('')
  })

  const fakeMetaData = {
    id: 'xyz_condition-race_and_ethnicity' as DatasetId,
    name: 'Some Data Place',
    source_id: 'this_that' as DataSourceId,
    original_data_sourced: 'Jan 1983',
  }

  // including strings that have double-quotes and commas
  const fakeRows = [
    {
      population_pct: 1.0,
      race_and_ethnicity: 'All',
      state_fips: '01',
      state_name: 'Alabama',
      some_condition_per_100k: null,
      some_condition_pct_share: '<0.01',
    },
    {
      population_pct: 99.0,
      race_and_ethnicity: 'Asian, Native Hawaiian, and Pacific Islander',
      state_fips: '01',
      state_name: 'Alabama',
      some_condition_per_100k: null,
      some_condition_pct_share: '<0.01',
    },
  ]

  const expectedColumnNames = [
    'population_pct',
    'race_and_ethnicity',
    'state_fips',
    'state_name',
    'some_condition_per_100k',
    'some_condition_pct_share',
  ]

  const expectedCsvString =
    'population_pct,race_and_ethnicity,state_fips,state_name,some_condition_per_100k,some_condition_pct_share\r\n1,All,01,Alabama,,<0.01\r\n99,"Asian, Native Hawaiian, and Pacific Islander",01,Alabama,,<0.01'

  const dataset = new Dataset(fakeRows, fakeMetaData)

  test('Testing getAllColumnNames()', async () => {
    expect(dataset.getAllColumnNames()).toEqual(expectedColumnNames)
  })

  test('Testing toCsvString()', async () => {
    expect(dataset.toCsvString()).toEqual(expectedCsvString)
  })
})
