import { AGE, RACE } from '../utils/Constants'
import { Breakdowns, resolveDemographicType } from './Breakdowns'
import { MetricQuery } from './MetricQuery'

describe('resolveDemographicType', () => {
  test('keeps a known demographic type', () => {
    expect(resolveDemographicType(AGE, RACE)).toBe(AGE)
  })

  test('falls back for a missing or unknown value', () => {
    expect(resolveDemographicType(undefined, RACE)).toBe(RACE)
    expect(resolveDemographicType('race', RACE)).toBe(RACE)
    expect(resolveDemographicType('fips', RACE)).toBe(RACE)
  })

  test('a resolved unknown value still builds a keyable query', () => {
    const demographicType = resolveDemographicType('not-a-demo', RACE)
    const query = new MetricQuery(
      ['population'],
      Breakdowns.national().addBreakdown(demographicType),
    )
    expect(() => query.getUniqueKey()).not.toThrow()
  })
})
