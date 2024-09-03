import type {
  DataTypeConfig,
  DataTypeId,
  MetricId,
} from '../data/config/MetricConfig'
import { AGE, ALL, BLACK, BLACK_NH, RACE, SEX } from '../data/utils/Constants'
import { Fips } from '../data/utils/Fips'
import { type CountColsMap, defaultHigherIsBetterMapConfig } from './mapGlobals'
import {
  addCountsTooltipInfo,
  buildTooltipTemplate,
  createBarLabel,
  formatPreventZero100k,
  getCawpMapGroupDenominatorLabel,
  getCawpMapGroupNumeratorLabel,
  getCountyAddOn,
  getHighestLowestGroupsByFips,
  getMapGroupLabel,
} from './mapHelperFunctions'

import { describe, test, expect } from 'vitest'

describe('Test addCountsTooltipInfo()', () => {
  const phrmaCountColsMap: CountColsMap = {
    numeratorConfig: {
      metricId: 'statins_adherence_estimated_total',
      shortLabel: 'adherent beneficiaries',
      chartTitle: '',
      type: 'count',
    },
    denominatorConfig: {
      metricId: 'statins_beneficiaries_estimated_total',
      shortLabel: 'total beneficiaries',
      chartTitle: '',
      type: 'count',
    },
  }

  test('ALL / SEX / PHRMA', () => {
    const sexAllTooltipPairs = addCountsTooltipInfo(
      'sex',
      {},
      phrmaCountColsMap,
      'All',
    )

    const expectedTooltipPairsSexAll = {
      '# adherent beneficiaries overall':
        'datum.statins_adherence_estimated_total',
      '# total beneficiaries overall':
        'datum.statins_beneficiaries_estimated_total',
    }

    expect(sexAllTooltipPairs).toEqual(expectedTooltipPairsSexAll)
  })

  test('Ages 1-100 / AGE / PHRMA', () => {
    const ageTooltipPairs = addCountsTooltipInfo(
      'age',
      {},
      phrmaCountColsMap,
      '1-100',
    )

    const expectedTooltipPairsSexAll = {
      '# adherent beneficiaries — Ages 1-100':
        'datum.statins_adherence_estimated_total',
      '# total beneficiaries — Ages 1-100':
        'datum.statins_beneficiaries_estimated_total',
    }

    expect(ageTooltipPairs).toEqual(expectedTooltipPairsSexAll)
  })

  test('Black / RACE / PHRMA', () => {
    const raceTooltipPairs = addCountsTooltipInfo(
      'race_and_ethnicity',
      {},
      phrmaCountColsMap,
      BLACK_NH,
    )

    const expectedTooltipPairsSexAll = {
      '# adherent beneficiaries — Black (NH)':
        'datum.statins_adherence_estimated_total',
      '# total beneficiaries — Black (NH)':
        'datum.statins_beneficiaries_estimated_total',
    }

    expect(raceTooltipPairs).toEqual(expectedTooltipPairsSexAll)
  })

  const cawpCountColsMap: CountColsMap = {
    numeratorConfig: {
      metricId: 'women_this_race_us_congress_count',
      shortLabel: 'members',
      chartTitle: '',
      type: 'count',
    },
    denominatorConfig: {
      metricId: 'total_us_congress_count',
      shortLabel: 'total members',
      chartTitle: '',
      type: 'count',
    },
  }

  test('Black / RACE / CAWP', () => {
    const raceTooltipPairs = addCountsTooltipInfo(
      'race_and_ethnicity',
      {},
      cawpCountColsMap,
      BLACK,
      true,
    )

    const expectedTooltipPairsCawpBlack = {
      '# Black or African American women members':
        'datum.women_this_race_us_congress_count',
      '# total members': 'datum.total_us_congress_count',
    }

    expect(raceTooltipPairs).toEqual(expectedTooltipPairsCawpBlack)
  })
})

describe('Test getMapGroupLabel()', () => {
  test('All becomes Overall', () => {
    expect(getMapGroupLabel('lis', ALL, 'Some measure')).toEqual(
      'Some measure overall',
    )
  })

  test('Race group ', () => {
    expect(getMapGroupLabel(RACE, BLACK_NH, 'Some measure')).toEqual(
      'Some measure — Black (NH)',
    )
  })

  test('Age group ', () => {
    expect(getMapGroupLabel(AGE, '0-99', 'Some measure')).toEqual(
      'Some measure — Ages 0-99',
    )
  })

  test('Sex or anything else passes through', () => {
    expect(getMapGroupLabel(SEX, 'GroupABC', 'Some measure')).toEqual(
      'Some measure — GroupABC',
    )
  })
})

describe('Test getCawpMapGroupNumeratorLabel() and getCawpMapGroupLDenominatorLabel()', () => {
  const cawpCountColsMap: CountColsMap = {
    numeratorConfig: {
      metricId: 'women_this_race_state_leg_count',
      shortLabel: 'legislators',
      chartTitle: '',
      type: 'count',
    },
    denominatorConfig: {
      metricId: 'total_state_leg_count',
      shortLabel: 'Total legislators',
      chartTitle: '',
      type: 'count',
    },
  }

  test('NUMERATOR All becomes Overall', () => {
    expect(getCawpMapGroupNumeratorLabel(cawpCountColsMap, ALL)).toEqual(
      'Women legislators overall',
    )
  })

  test('NUMERATOR Black', () => {
    expect(getCawpMapGroupNumeratorLabel(cawpCountColsMap, BLACK)).toEqual(
      'Black or African American women legislators',
    )
  })

  test('DENOMINATOR always overall', () => {
    expect(getCawpMapGroupDenominatorLabel(cawpCountColsMap)).toEqual(
      'Total legislators',
    )
  })
})

describe('Test buildTooltipTemplate()', () => {
  test('generates vega template string with a title, no SVI', () => {
    const wTitleNoSvi = buildTooltipTemplate(
      /* tooltipPairs */ {
        [`"Some Condition"`]: 'datum.some_condition_per100k',
      },
      /* title? */ `"Some State"`,
      /* includeSvi */ false,
    )
    expect(wTitleNoSvi).toEqual(
      '{title: "Some State",""Some Condition"": datum.some_condition_per100k,}',
    )
  })

  test('generates vega template string with no title, with SVI', () => {
    const noTitleWithSvi = buildTooltipTemplate(
      /* tooltipPairs */ {
        [`"Some Other Condition"`]: 'datum.some_other_condition_per100k',
      },
      /* title? */ undefined,
      /* includeSvi */ true,
    )
    expect(noTitleWithSvi).toEqual(
      '{""Some Other Condition"": datum.some_other_condition_per100k,"County SVI": datum.rating}',
    )
  })
})

describe('Test getCountyAddOn()', () => {
  test('A child FIPS of Alaska should get equiv', () => {
    const alaskaAddOn = getCountyAddOn(
      /* fips */ new Fips('02290'),
      /* showCounties */ true,
    )
    expect(alaskaAddOn).toEqual('(County Equivalent)')
  })

  test('A child FIPS of Louisiana should get parish', () => {
    const louisianaAddOn = getCountyAddOn(
      /* fips */ new Fips('22001'),
      /* showCounties */ true,
    )
    expect(louisianaAddOn).toEqual('Parish (County Equivalent)')
  })

  test('A child FIPS of Puerto Rico should get equiv', () => {
    const puertoRicoAddOn = getCountyAddOn(
      /* fips */ new Fips('72001'),
      /* showCounties */ true,
    )
    expect(puertoRicoAddOn).toEqual('(County Equivalent)')
  })

  test('AL should get blank string', () => {
    const alabamaAddOn = getCountyAddOn(
      /* fips */ new Fips('02'),
      /* showCounties */ false,
    )
    expect(alabamaAddOn).toEqual('')
  })
})

describe('Test getHighestLowestGroupsByFips()', () => {
  test('Normal data gives a high and a low', () => {
    const normalData = [
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
      { fips: '05', sex: 'All', condition_per_100k: 2000 },
      { fips: '06', sex: 'Male', condition_per_100k: 2000 },
      { fips: '06', sex: 'Female', condition_per_100k: 2000 },
      { fips: '07', sex: 'A', condition_per_100k: 0 },
      { fips: '07', sex: 'B', condition_per_100k: 0 },
      { fips: '07', sex: 'C', condition_per_100k: 0 },
      { fips: '07', sex: 'D', condition_per_100k: 0 },
    ]

    const testDataTypeConfig: DataTypeConfig = {
      dataTypeId: 'some_datatype_id' as DataTypeId,
      dataTypeShortLabel: '',
      fullDisplayName: '',
      metrics: {},
      dataTableTitle: '',
      mapConfig: defaultHigherIsBetterMapConfig,
      categoryId: 'covid',
    }

    const highLowSex = getHighestLowestGroupsByFips(
      /* dataTypeConfig */ testDataTypeConfig,
      /* fullData */ normalData,
      /* demographicType */ 'sex',
      /* metricId */ 'condition_per_100k' as MetricId,
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
        highest: 'Multiple groups',
        lowest: 'Other',
      },
      '05': undefined,
      '06': undefined,
      '07': undefined,
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
      usePercentSuffix,
    )

    expect(result).toEqual(
      '[datum.hiv_prevalence_per_100k__DISPLAY_true, " per 100k"]',
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
      usePercentSuffix,
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
      usePercentSuffix,
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
      usePercentSuffix,
    )

    expect(result).toEqual('datum.asthma_per_100k__DISPLAY_true + " per 100k"')
  })
})
