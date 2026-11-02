import { AGE, RACE } from '../utils/Constants'
import { resolveDemographicType } from './Breakdowns'

describe('resolveDemographicType', () => {
  test('keeps a known demographic type', () => {
    expect(resolveDemographicType(AGE, RACE)).toBe(AGE)
  })

  test('falls back for a missing or unknown value', () => {
    expect(resolveDemographicType(undefined, RACE)).toBe(RACE)
    expect(resolveDemographicType('race', RACE)).toBe(RACE)
    expect(resolveDemographicType('fips', RACE)).toBe(RACE)
  })
})
