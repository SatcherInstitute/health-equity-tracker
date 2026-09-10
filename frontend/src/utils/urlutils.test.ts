import {
  getDemographicGroupsFromGroupsParam,
  getGroupsParamFromDemographicGroups,
  slugify,
} from './urlutils'

describe('slugify', () => {
  it('should convert a string to a slug', () => {
    expect(slugify('This is a test')).toBe('this-is-a-test')
  })
  it('should remove special characters', () => {
    expect(slugify('This is a test!')).toBe('this-is-a-test')
  })
})

describe('group list param codec', () => {
  it('round-trips groups that exercise every escaped character', () => {
    const groups = [
      'Black or African American (NH)', // ' (NH)' -> '.NH'
      'Hispanic or Latino', // space -> '_'
      'Indigenous, Asian & Pacific Islander women', // '/' -> '~'
      'Two or more races (NH)', // '+' -> 'PLUS'
      '18-44', // age bucket passes through untouched
    ]
    expect(
      getDemographicGroupsFromGroupsParam(
        getGroupsParamFromDemographicGroups(groups),
      ),
    ).toEqual(groups)
  })

  it('keeps the separator literal through URLSearchParams', () => {
    const encoded = getGroupsParamFromDemographicGroups([
      'Black or African American (NH)',
      'Hispanic or Latino',
    ])
    expect(encoded).toBe('Black.NH*Hisp~Lat')
    // The separator must survive as a literal `*` so a shared link stays
    // readable; the escaped characters inside a group may percent-encode.
    const params = new URLSearchParams({ rateGroups1: encoded })
    expect(params.toString()).toBe('rateGroups1=Black.NH*Hisp%7ELat')
    expect(
      getDemographicGroupsFromGroupsParam(
        new URLSearchParams(params.toString()).get('rateGroups1') ?? '',
      ),
    ).toEqual(['Black or African American (NH)', 'Hispanic or Latino'])
  })

  it('treats an empty param as no filter', () => {
    expect(getGroupsParamFromDemographicGroups([])).toBe('')
    expect(getDemographicGroupsFromGroupsParam('')).toEqual([])
  })
})
