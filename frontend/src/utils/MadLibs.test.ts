import {
  getFipsListFromMadlib,
  getValidatedSelections,
  insertOptionalThe,
  MADLIB_LIST,
} from './MadLibs'
import { parseMls } from './urlutils'

const _the = ' the'
const _no_the = ''

const usaOneVarSelections = { 1: 'covid_cases', 3: '00' }
const usaOneDoesNotGetThe = 0
const usaOneGetsThe = 2

const usaTwoGeoSelections = { 1: 'covid_cases', 3: '00', 5: '13' }
const usaTwoGeoDoesNotGetThe = 0
const usaTwoGeoGetsThe = 2
const usaTwoGeoAlsoDoesNotGetThe = 0

describe('MadLib Unit Tests', () => {
  test('Test insertOptionalThe()', async () => {
    expect(insertOptionalThe(usaOneVarSelections, usaOneDoesNotGetThe)).toEqual(
      _no_the,
    )

    expect(insertOptionalThe(usaOneVarSelections, usaOneGetsThe)).toEqual(_the)

    expect(
      insertOptionalThe(usaTwoGeoSelections, usaTwoGeoDoesNotGetThe),
    ).toEqual(_no_the)

    expect(insertOptionalThe(usaTwoGeoSelections, usaTwoGeoGetsThe)).toEqual(
      _the,
    )

    expect(
      insertOptionalThe(usaTwoGeoSelections, usaTwoGeoAlsoDoesNotGetThe),
    ).toEqual(_no_the)
  })
})

describe('getValidatedSelections', () => {
  const [disparity, comparegeos] = MADLIB_LIST

  test('keeps a valid location', () => {
    expect(getValidatedSelections(disparity, parseMls('1.hiv-3.13'))).toEqual({
      1: 'hiv',
      3: '13',
    })
  })

  test('falls back to the default when the location slot is missing', () => {
    const selections = getValidatedSelections(
      comparegeos,
      parseMls('1.hiv-3.13'),
    )
    expect(selections[5]).toBe(comparegeos.defaultSelections[5])
    expect(() =>
      getFipsListFromMadlib({ ...comparegeos, activeSelections: selections }),
    ).not.toThrow()
  })

  test('falls back to the default when the location is malformed', () => {
    expect(getValidatedSelections(disparity, parseMls('1.hiv-3'))[3]).toBe(
      disparity.defaultSelections[3],
    )
    expect(getValidatedSelections(disparity, parseMls('1.hiv-3.abc'))[3]).toBe(
      disparity.defaultSelections[3],
    )
  })

  test('falls back to the default for a well-formed but unknown location', () => {
    for (const code of ['99', '99999']) {
      expect(
        getValidatedSelections(disparity, parseMls(`1.hiv-3.${code}`))[3],
      ).toBe(disparity.defaultSelections[3])
    }
    expect(
      getValidatedSelections(disparity, parseMls('1.hiv-3.13121'))[3],
    ).toBe('13121')
  })
})
