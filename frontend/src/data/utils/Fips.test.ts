import { failInvalidFips, Fips, sortFipsObjects } from './Fips'

describe('Test getDisplayName()', () => {
  test('US/STATE with no addon', async () => {
    expect(new Fips('00').getDisplayName()).toEqual('United States')
  })
  test('County without addon', async () => {
    expect(new Fips('02016').getDisplayName()).toEqual(
      'Aleutians West Census Area'
    )
  })
  test('County with Parish addon', async () => {
    expect(new Fips('22001').getDisplayName()).toEqual('Acadia Parish')
  })
  test('County with county addon', async () => {
    expect(new Fips('08031').getDisplayName()).toEqual('Denver County')
  })
})

describe('Test getSentenceDisplayName()', () => {
  test('The US', async () => {
    expect(new Fips('00').getSentenceDisplayName()).toEqual('the United States')
  })
})

describe('Test failInvalidFips()', () => {
  test('Good USA FIPS', async () => {
    expect(failInvalidFips('00')).toEqual(undefined)
  })
  test('Good state FIPS', async () => {
    expect(failInvalidFips('01')).toEqual(undefined)
  })
  test('Good county FIPS', async () => {
    expect(failInvalidFips('01011')).toEqual(undefined)
  })
  test('KNOWN ISSUE: Bad FIPS with 2 or 5 digit format will pass', async () => {
    expect(failInvalidFips('99999')).toEqual(undefined)
  })
  test('Bad number of digits FIPS', async () => {
    expect(() => {
      failInvalidFips('1')
    }).toThrow('Invalid FIPS code')
  })
  test('Bad non-digits FIPS', async () => {
    expect(() => {
      failInvalidFips('1A')
    }).toThrow('Invalid FIPS code')
  })
})

describe('Test getFipsCategory()', () => {
  test('The US', async () => {
    expect(new Fips('00').getFipsCategory()).toEqual('National')
  })
  test('A State', async () => {
    expect(new Fips('01').getFipsCategory()).toEqual('States')
  })
  test('A Territory', async () => {
    expect(new Fips('78').getFipsCategory()).toEqual('Territories')
  })
  test('A County of a State', async () => {
    expect(new Fips('01001').getFipsCategory()).toEqual('Alabama Counties')
  })
  test('A County-Equivalent of a Territory', async () => {
    expect(new Fips('78001').getFipsCategory()).toEqual(
      'U.S. Virgin Islands County Equivalents'
    )
  })
})

describe('Test sortFipsObjects()', () => {
  test('Sort FIPS objects by by category by alpha', async () => {
    const fipsObjects = [
      new Fips('78020'),
      new Fips('01'),
      new Fips('01001'),
      new Fips('02'),
      new Fips('56'),
      new Fips('02016'),
      new Fips('78'),
      new Fips('78010'),
      new Fips('00'),
    ]
    const sortedFipsObjects = sortFipsObjects(fipsObjects)

    expect(sortedFipsObjects.map((fips) => fips.getDisplayName())).toEqual([
      // National
      'United States',
      // States
      'Alabama',
      'Alaska',
      'Wyoming',
      // Territories
      'U.S. Virgin Islands',
      // Alabama Counties
      'Autauga County',
      // Alaska Counties
      'Aleutians West Census Area',
      // U.S. Virgin Islands County Equivalents
      'St. Croix',
      'St. John',
    ])
  })
})
