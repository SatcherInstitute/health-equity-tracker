import { MetricId } from '../data/config/MetricConfig'
import { Fips } from '../data/utils/Fips'
import {
  buildTooltipTemplate,
  getCountyAddOn,
  getHighestLowestGroupsByFips,
} from './mapHelpers'

describe('Test buildTooltipTemplate()', () => {
  test('generates vega template string with a title, no SVI', () => {
    const wTitleNoSvi = buildTooltipTemplate(
      /* tooltipPairs */ {
        [`"Some Condition"`]: 'datum.some_condition_per100k',
      },
      /* title? */ `"Some State"`,
      /* includeSvi */ false
    )
    expect(wTitleNoSvi).toEqual(
      '{title: "Some State",""Some Condition"": datum.some_condition_per100k,}'
    )
  })

  test('generates vega template string with no title, with SVI', () => {
    const noTitleWithSvi = buildTooltipTemplate(
      /* tooltipPairs */ {
        [`"Some Other Condition"`]: 'datum.some_other_condition_per100k',
      },
      /* title? */ undefined,
      /* includeSvi */ true
    )
    expect(noTitleWithSvi).toEqual(
      '{""Some Other Condition"": datum.some_other_condition_per100k,"County SVI": datum.rating}'
    )
  })
})

describe('Test getCountyAddOn()', () => {
  test('A child FIPS of Alaska should get equiv', () => {
    const alaskaAddOn = getCountyAddOn(
      /* fips */ new Fips('02290'),
      /* showCounties */ true
    )
    expect(alaskaAddOn).toEqual('(County Equivalent)')
  })

  test('A child FIPS of Louisiana should get parish', () => {
    const louisianaAddOn = getCountyAddOn(
      /* fips */ new Fips('22001'),
      /* showCounties */ true
    )
    expect(louisianaAddOn).toEqual('Parish (County Equivalent)')
  })

  test('A child FIPS of Puerto Rico should get equiv', () => {
    const puertoRicoAddOn = getCountyAddOn(
      /* fips */ new Fips('72001'),
      /* showCounties */ true
    )
    expect(puertoRicoAddOn).toEqual('(County Equivalent)')
  })

  test('AL should get blank string', () => {
    const alabamaAddOn = getCountyAddOn(
      /* fips */ new Fips('02'),
      /* showCounties */ false
    )
    expect(alabamaAddOn).toEqual('')
  })
})

describe('Test getHighestLowestGroupsByFips()', () => {
  const testData = [
    { fips: '01', sex: 'All', condition_per_100k: 2000 },
    { fips: '01', sex: 'Male', condition_per_100k: 1000 },
    { fips: '01', sex: 'Female', condition_per_100k: 3000 },
    { fips: '02', sex: 'All', condition_per_100k: 2000 },
    { fips: '02', sex: 'Male', condition_per_100k: 10 },
    { fips: '02', sex: 'Female', condition_per_100k: 30 },
    { fips: '03', sex: 'Other', condition_per_100k: 1 },
    { fips: '03', sex: 'All', condition_per_100k: 2 },
    { fips: '03', sex: 'Male', condition_per_100k: undefined },
    { fips: '04', sex: 'Other', condition_per_100k: 999 },
    { fips: '04', sex: 'Male', condition_per_100k: 1000 },
    { fips: '04', sex: 'Female', condition_per_100k: 1000 },
  ]
  test('Normal data gives a high and a low', () => {
    const highLowSex = getHighestLowestGroupsByFips(
      /* fullData */ testData,
      /* breakdown */ 'sex',
      /* metricId */ 'condition_per_100k' as MetricId
    )

    expect(highLowSex).toEqual({
      '01': {
        highest: 'Female',
        lowest: 'Male',
      },
      '02': {
        highest: 'Female',
        lowest: 'Male',
      },
      // 03 is undefined intentionally
      '04': {
        lowest: 'Other',
      },
    })
  })
})
