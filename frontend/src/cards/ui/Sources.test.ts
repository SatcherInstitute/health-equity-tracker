import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../../data/config/DatasetMetadata'
import { stripCountyFips } from './SourcesHelpers'

describe('stripCountyFips', () => {
  it('Should return string without fips code', () => {
    const output: Array<DatasetId> = [
      'cdc_restricted_data-by_race_county_processed_time_series',
    ]
    const input: Array<DatasetId | DatasetIdWithStateFIPSCode> = [
      'cdc_restricted_data-by_race_county_processed_time_series-48',
    ]
    expect(stripCountyFips(input)).toEqual(output)
  })
  it("Should return input when county level data isn't being displayed", () => {
    const output: Array<DatasetId> = ['some_state_set' as DatasetId]
    const input: Array<DatasetId | DatasetIdWithStateFIPSCode> = [
      'some_state_set' as DatasetId,
    ]
    expect(stripCountyFips(input)).toEqual(output)
  })

  it('Should return multiple strings without fips code', () => {
    const output: Array<DatasetId> = [
      'cdc_restricted_data-by_race_county_processed_time_series',
      'cdc_restricted_data-by_age_county_processed_time_series',
      'cdc_restricted_data-by_race_county_processed_time_series',
    ]
    const input: Array<DatasetId | DatasetIdWithStateFIPSCode> = [
      'cdc_restricted_data-by_race_county_processed_time_series-48',
      'cdc_restricted_data-by_age_county_processed_time_series-48',
      'cdc_restricted_data-by_race_county_processed_time_series',
    ]
    expect(stripCountyFips(input)).toEqual(output)
  })
})
