import type { TrendsData } from '../../charts/trendsChart/types'
import { METRIC_CONFIG } from '../config/MetricConfig'
import {
  generateConsecutivePeriods,
  getElectionYearData,
  getMinMaxGroups,
  getNestedData,
  getNestedUnknowns,
  getPrettyDate,
  interpolateTimePeriods,
  makeA11yTableData,
} from './DatasetTimeUtils'
import type { HetRow } from './DatasetTypes'
import { splitIntoKnownsAndUnknowns } from './datasetutils'

describe('Tests for time_period functions', () => {
  test('test interpolateTimePeriods()', () => {
    const dataMissingMonths = [
      { time_period: '2020-01', some_metric: 1 },
      { time_period: '2020-02', some_metric: 2 },
      // one missing month of data
      { time_period: '2020-04', some_metric: 4 },
      { time_period: '2020-05', some_metric: 5 },
    ]

    const dataAllMonths = [
      { time_period: '2020-01', some_metric: 1 },
      { time_period: '2020-02', some_metric: 2 },
      { time_period: '2020-03', some_metric: undefined },
      { time_period: '2020-04', some_metric: 4 },
      { time_period: '2020-05', some_metric: 5 },
    ]

    expect(interpolateTimePeriods(dataMissingMonths)).toEqual(dataAllMonths)
  })

  test('Testing generateConsecutivePeriods()', async () => {
    const testDataMonthly = [
      { time_period: '2000-01', anything_per_100k: 1234 },
      { time_period: '2000-03', anything_per_100k: 5678 },
    ]

    const expectedConsecutivePeriodsMonthly = ['2000-01', '2000-02', '2000-03']

    expect(generateConsecutivePeriods(testDataMonthly)).toEqual(
      expectedConsecutivePeriodsMonthly,
    )

    const testDataYearly = [
      { time_period: '2001', anything_per_100k: 1234 },
      { time_period: '2003', anything_per_100k: 5678 },
    ]

    const expectedConsecutivePeriodsYearly = ['2001', '2002', '2003']

    expect(generateConsecutivePeriods(testDataYearly)).toEqual(
      expectedConsecutivePeriodsYearly,
    )
  })
})

const twoYearsOfNormalData = [
  {
    sex: 'Male',
    jail_per_100k: 3000,
    jail_pct_share: 30.0,
    time_period: '2020',
  },
  {
    sex: 'Male',
    jail_per_100k: 2000,
    jail_pct_share: 30.0,
    time_period: '2021',
  },
  {
    sex: 'Female',
    jail_per_100k: 300,
    jail_pct_share: 30.0,
    time_period: '2020',
  },
  {
    sex: 'Female',
    jail_per_100k: 200,
    jail_pct_share: 30.0,
    time_period: '2021',
  },
  {
    sex: 'Unknown',
    jail_per_100k: null,
    jail_pct_share: 40.0,
    time_period: '2020',
  },
  {
    sex: 'Unknown',
    jail_per_100k: null,
    jail_pct_share: 40.0,
    time_period: '2021',
  },
]

const twoYearsOfNestedData = [
  [
    'Male',
    [
      ['2020', 3000],
      ['2021', 2000],
    ],
  ],
  [
    'Female',
    [
      ['2020', 300],
      ['2021', 200],
    ],
  ],
]

describe('Tests for nesting functions', () => {
  test('test getNestedData()', () => {
    expect(
      getNestedData(
        twoYearsOfNormalData,
        ['Male', 'Female'],
        'sex',
        'jail_per_100k',
      ),
    ).toEqual(twoYearsOfNestedData)
  })

  test('test getNestedUnknowns()', () => {
    const twoYearsOfUnknownsFromNormalData = twoYearsOfNormalData.filter(
      (row) => row.sex === 'Unknown',
    )
    const expectedNestedUnknowns = [
      ['2020', 40],
      ['2021', 40],
    ]

    expect(
      getNestedUnknowns(twoYearsOfUnknownsFromNormalData, 'jail_pct_share'),
    ).toEqual(expectedNestedUnknowns)
  })

  test('getNestedUnknowns() on missing metricId returns []', () => {
    expect(getNestedUnknowns(twoYearsOfNormalData, undefined)).toEqual([])
  })
  test('getNestedUnknowns() on undefined data returns []', () => {
    expect(getNestedUnknowns(undefined, 'jail_pct_share')).toEqual([])
  })
})

describe('Tests for A11y Table Data functions', () => {
  test('test makeA11yTableData()', () => {
    const [known, unknown] = splitIntoKnownsAndUnknowns(
      twoYearsOfNormalData,
      'sex',
    )

    const expectedA11yTableDataOnlyMale: HetRow[] = [
      {
        '% of total jail population with unknown sex': 40,
        Male: 2000,
        'Time period': '2021',
      },
      {
        '% of total jail population with unknown sex': 40,
        Male: 3000,
        'Time period': '2020',
      },
    ]

    const jail = METRIC_CONFIG.incarceration[1]

    const knownMetric = jail?.metrics.per100k
    const unknownMetric = jail?.metrics.pct_share

    expect(
      makeA11yTableData(
        known,
        unknown,
        'sex',
        knownMetric!,
        unknownMetric!,
        ['Male'],
        /* hasUnknowns */ true,
      ),
    ).toEqual(expectedA11yTableDataOnlyMale)
  })
})

describe('Tests min max functions', () => {
  test('test getMinMaxGroups()', () => {
    expect(getMinMaxGroups(twoYearsOfNestedData as TrendsData)).toEqual([
      'Female',
      'Male',
    ])
  })
})

describe('Tests getPrettyDate() function', () => {
  test('YYYY gets passed through', () => {
    expect(getPrettyDate('2020')).toEqual('2020')
  })
  test('YYYY-MM conversion', () => {
    expect(getPrettyDate('2020-01')).toEqual('Jan 2020')
  })
  test("don't convert, just pass through malformed YY-M", () => {
    expect(getPrettyDate('20-1')).toEqual('20-1')
  })
  test("don't convert, just pass through random string", () => {
    expect(getPrettyDate('abc')).toEqual('abc')
  })
  test("don't convert, just pass through sneaky almost matching string", () => {
    expect(getPrettyDate('ABCD-YZ')).toEqual('ABCD-YZ')
  })
})

describe('getElectionYearData', () => {
  it('should return only election years (divisible by 4 or 2)', () => {
    const inputData: HetRow[] = [
      { time_period: '2008', voter_participation_pct_rate: 47.6 },
      { time_period: '2009', women_in_gov: 25.0 },
      { time_period: '2010' },
      { time_period: '2011', women_in_gov: 25.0 },
      { time_period: '2012', voter_participation_pct_rate: 47.3 },
      { time_period: '2013', women_in_gov: 25.0 },
      { time_period: '2014' },
      { time_period: '2015', women_in_gov: 25.0 },
      { time_period: '2016', voter_participation_pct_rate: 49 },
    ]

    const result4yearly = getElectionYearData(inputData, 'fourYearly')
    expect(result4yearly).toEqual([
      { time_period: '2008', voter_participation_pct_rate: 47.6 },
      { time_period: '2012', voter_participation_pct_rate: 47.3 },
      { time_period: '2016', voter_participation_pct_rate: 49 },
    ])

    const result2yearly = getElectionYearData(inputData, 'twoYearly')
    expect(result2yearly).toEqual([
      { time_period: '2009', women_in_gov: 25.0 },
      { time_period: '2011', women_in_gov: 25.0 },
      { time_period: '2013', women_in_gov: 25.0 },
      { time_period: '2015', women_in_gov: 25.0 },
    ])
  })
})
