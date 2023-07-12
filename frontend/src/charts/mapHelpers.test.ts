import { MetricId } from '../data/config/MetricConfig'
import { Fips } from '../data/utils/Fips'
import {
  buildTooltipTemplate,
  createBarLabel,
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

describe('Test createBarLabel()', () => {
  test('If chartIsSmall is true and usePercentSuffix is false, it should return multiLineLabel', () => {
    const chartIsSmall = true
    const usePercentSuffix = false
    const measure = 'hiv_prevalence_per_100k'
    const tooltipMetricDisplayColumnName =
      'hiv_prevalence_per_100k__DISPLAY_true'

    const result = createBarLabel(
      chartIsSmall,
      measure,
      tooltipMetricDisplayColumnName,
      usePercentSuffix
    )

    expect(result).toEqual(
      '[datum.hiv_prevalence_per_100k__DISPLAY_true, " per 100k"]'
    )
  })

  test('If chartIsSmall and usePercentSuffix are true, it should return singleLineLabel', () => {
    const chartIsSmall = true
    const usePercentSuffix = true
    const measure = 'pct_share_of_us_congress'
    const tooltipMetricDisplayColumnName =
      'pct_share_of_us_congress__DISPLAY_true'

    const result = createBarLabel(
      chartIsSmall,
      measure,
      tooltipMetricDisplayColumnName,
      usePercentSuffix
    )

    expect(result).toEqual('datum.pct_share_of_us_congress__DISPLAY_true + "%"')
  })

  test('If chartIsSmall is false and usePercentSuffix is true, it should return singleLineLabel', () => {
    const chartIsSmall = false
    const usePercentSuffix = false
    const measure = 'hiv_stigma_index'
    const tooltipMetricDisplayColumnName = 'hiv_stigma_index__DISPLAY_true'

    const result = createBarLabel(
      chartIsSmall,
      measure,
      tooltipMetricDisplayColumnName,
      usePercentSuffix
    )

    expect(result).toEqual('datum.hiv_stigma_index__DISPLAY_true + ""')
  })

  test('If chartIsSmall and usePercentSuffix are false, it should return singleLineLabel', () => {
    const chartIsSmall = false
    const usePercentSuffix = false
    const measure = 'asthma_per_100k'
    const tooltipMetricDisplayColumnName = 'asthma_per_100k__DISPLAY_true'

    const result = createBarLabel(
      chartIsSmall,
      measure,
      tooltipMetricDisplayColumnName,
      usePercentSuffix
    )

    expect(result).toEqual('datum.asthma_per_100k__DISPLAY_true + " per 100k"')
  })
})
