import { describe, expect, it } from 'vitest'
import { exclude } from '../query/BreakdownFilter'
import { Breakdowns } from '../query/Breakdowns'
import { MetricQuery } from '../query/MetricQuery'
import { Fips } from '../utils/Fips'
import VariableProvider from './VariableProvider'

// Minimal concrete subclass — only the abstract methods need stubs
class TestProvider extends VariableProvider {
  constructor() {
    super('test_provider', [])
  }

  async getDataInternal() {
    return { data: [], consumedDatasetIds: [] } as any
  }

  allowsBreakdowns() {
    return true
  }
}

const provider = new TestProvider()

// ---------------------------------------------------------------------------
// filterByGeo
// ---------------------------------------------------------------------------

const NATIONAL_ROWS = [
  { state_fips: '01', state_name: 'Alabama', value: 1 },
  { state_fips: '02', state_name: 'Alaska', value: 2 },
]

const COUNTY_ROWS = [
  { county_fips: '01001', county_name: 'Autauga', state_fips: '01', value: 1 },
  { county_fips: '01003', county_name: 'Baldwin', state_fips: '01', value: 2 },
  {
    county_fips: '02013',
    county_name: 'Aleutians East',
    state_fips: '02',
    value: 3,
  },
]

describe('VariableProvider.filterByGeo', () => {
  it('returns all rows when no filterFips is set', () => {
    const breakdowns = Breakdowns.byState()
    expect(provider.filterByGeo(NATIONAL_ROWS, breakdowns)).toEqual(
      NATIONAL_ROWS,
    )
  })

  it('filters state rows by state fips code', () => {
    const breakdowns = Breakdowns.byState().withGeoFilter(new Fips('01'))
    expect(provider.filterByGeo(NATIONAL_ROWS, breakdowns)).toEqual([
      { state_fips: '01', state_name: 'Alabama', value: 1 },
    ])
  })

  it('filters county rows by specific county fips code', () => {
    const breakdowns = Breakdowns.byCounty().withGeoFilter(new Fips('01001'))
    expect(provider.filterByGeo(COUNTY_ROWS, breakdowns)).toEqual([
      {
        county_fips: '01001',
        county_name: 'Autauga',
        state_fips: '01',
        value: 1,
      },
    ])
  })

  it('filters county rows to all counties within a state when filterFips is a state', () => {
    const breakdowns = Breakdowns.byCounty().withGeoFilter(new Fips('01'))
    const result = provider.filterByGeo(COUNTY_ROWS, breakdowns)
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.county_fips)).toEqual(['01001', '01003'])
  })
})

// ---------------------------------------------------------------------------
// renameGeoColumns
// ---------------------------------------------------------------------------

const GEO_ROWS = [
  {
    state_fips: '01',
    state_name: 'Alabama',
    county_fips: '01001',
    county_name: 'Autauga',
    value: 10,
  },
]

describe('VariableProvider.renameGeoColumns', () => {
  it('maps state columns to fips/fips_name and drops county columns', () => {
    const breakdowns = Breakdowns.byState()
    expect(provider.renameGeoColumns(GEO_ROWS, breakdowns)).toEqual([
      { fips: '01', fips_name: 'Alabama', value: 10 },
    ])
  })

  it('maps county columns to fips/fips_name and drops state columns', () => {
    const breakdowns = Breakdowns.byCounty()
    expect(provider.renameGeoColumns(GEO_ROWS, breakdowns)).toEqual([
      { fips: '01001', fips_name: 'Autauga', value: 10 },
    ])
  })
})

// ---------------------------------------------------------------------------
// removeUnrequestedColumns
// ---------------------------------------------------------------------------

const WIDE_ROWS = [
  {
    fips: '01',
    fips_name: 'Alabama',
    race_and_ethnicity: 'White',
    hiv_prevalence_per_100k: 5,
    extra_column: 'drop me',
    time_period: '2020',
  },
]

describe('VariableProvider.removeUnrequestedColumns', () => {
  it('keeps fips, fips_name, requested metric, and enabled demographic; drops the rest', () => {
    const breakdowns = Breakdowns.byState().andRace()
    const query = new MetricQuery(
      ['hiv_prevalence_per_100k'],
      breakdowns,
      'hiv_prevalence',
      'current',
    )
    expect(provider.removeUnrequestedColumns(WIDE_ROWS, query)).toEqual([
      {
        fips: '01',
        fips_name: 'Alabama',
        race_and_ethnicity: 'White',
        hiv_prevalence_per_100k: 5,
      },
    ])
  })

  it('also keeps time_period for historical queries', () => {
    const breakdowns = Breakdowns.byState().andRace()
    const query = new MetricQuery(
      ['hiv_prevalence_per_100k'],
      breakdowns,
      'hiv_prevalence',
      'historical',
    )
    expect(provider.removeUnrequestedColumns(WIDE_ROWS, query)).toEqual([
      {
        fips: '01',
        fips_name: 'Alabama',
        race_and_ethnicity: 'White',
        hiv_prevalence_per_100k: 5,
        time_period: '2020',
      },
    ])
  })
})

// ---------------------------------------------------------------------------
// applyDemographicBreakdownFilters
// ---------------------------------------------------------------------------

const RACE_ROWS = [
  { fips: '01', race_and_ethnicity: 'White', value: 1 },
  { fips: '01', race_and_ethnicity: 'Black or African American', value: 2 },
  { fips: '01', race_and_ethnicity: 'All', value: 3 },
]

describe('VariableProvider.applyDemographicBreakdownFilters', () => {
  it('returns all rows when the demographic breakdown has no filter', () => {
    const breakdowns = Breakdowns.byState().andRace()
    expect(
      provider.applyDemographicBreakdownFilters(RACE_ROWS, breakdowns),
    ).toEqual(RACE_ROWS)
  })

  it('includes only the specified values with an include filter', () => {
    const breakdowns = Breakdowns.byState().andRace({
      include: true,
      values: ['White', 'Black or African American'],
    })
    const result = provider.applyDemographicBreakdownFilters(
      RACE_ROWS,
      breakdowns,
    )
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.race_and_ethnicity)).toEqual([
      'White',
      'Black or African American',
    ])
  })

  it('excludes the specified values with an exclude filter', () => {
    const breakdowns = Breakdowns.byState().andRace(exclude('All'))
    const result = provider.applyDemographicBreakdownFilters(
      RACE_ROWS,
      breakdowns,
    )
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.race_and_ethnicity)).not.toContain('All')
  })
})

// ---------------------------------------------------------------------------
// castAllsAsRequestedDemographicBreakdown
// ---------------------------------------------------------------------------

const ALLS_ROWS = [
  { fips: '01', value: 10 },
  { fips: '02', value: 20 },
]

describe('VariableProvider.castAllsAsRequestedDemographicBreakdown', () => {
  it('stamps "All" on the sole enabled demographic column for every row', () => {
    const breakdowns = Breakdowns.byState().andRace()
    const result = provider.castAllsAsRequestedDemographicBreakdown(
      ALLS_ROWS,
      breakdowns,
    )
    expect(result).toEqual([
      { fips: '01', value: 10, race_and_ethnicity: 'All' },
      { fips: '02', value: 20, race_and_ethnicity: 'All' },
    ])
  })

  it('stamps "All" on the age column when age breakdown is requested', () => {
    const breakdowns = Breakdowns.byState().andAge()
    const result = provider.castAllsAsRequestedDemographicBreakdown(
      ALLS_ROWS,
      breakdowns,
    )
    expect(result).toEqual([
      { fips: '01', value: 10, age: 'All' },
      { fips: '02', value: 20, age: 'All' },
    ])
  })
})
