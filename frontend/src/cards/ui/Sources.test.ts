import type {
  DatasetId,
  DatasetIdWithStateFIPSCode,
} from '../../data/config/DatasetMetadata'
import { stripCountyFips } from './SourcesHelpers'

describe('stripCountyFips', () => {
  it('Should return string without fips code', () => {
    const output: Array<DatasetId> = [
      'cdc_restricted_data-race_county_historical',
    ]
    const input: Array<DatasetId | DatasetIdWithStateFIPSCode> = [
      'cdc_restricted_data-race_county_historical-48',
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
      'cdc_restricted_data-race_county_historical',
      'cdc_restricted_data-age_county_historical',
      'cdc_restricted_data-race_county_historical',
    ]
    const input: Array<DatasetId | DatasetIdWithStateFIPSCode> = [
      'cdc_restricted_data-race_county_historical-48',
      'cdc_restricted_data-age_county_historical-48',
      'cdc_restricted_data-race_county_historical',
    ]
    expect(stripCountyFips(input)).toEqual(output)
  })
})
