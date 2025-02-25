import type {
  DataTypeConfig,
  DataTypeId,
  MetricId,
} from '../data/config/MetricConfigTypes'
import { AGE, ALL, BLACK, BLACK_NH, RACE, SEX } from '../data/utils/Constants'
import { Fips } from '../data/utils/Fips'
import { type CountColsMap, defaultHigherIsBetterMapConfig } from './mapGlobals'
import {
  getCawpMapGroupDenominatorLabel,
  getCawpMapGroupNumeratorLabel,
  getCountyAddOn,
  getHighestLowestGroupsByFips,
  getMapGroupLabel,
} from './mapHelperFunctions'

import { describe, expect, test } from 'vitest'

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
