import { Fips } from '../utils/Fips'
import type BreakdownFilter from './BreakdownFilter'

export type TimeView = 'current' | 'historical'

export type GeographicBreakdown =
  | 'national'
  | 'state'
  | 'county'
  | 'territory'
  | 'state/territory'

export type DemographicType =
  | 'race_and_ethnicity'
  | 'age'
  | 'sex'
  | 'fips'
  | 'lis'
  | 'eligibility'
  | 'urbanicity'
  | 'income'
  | 'education'
  | 'insurance_status'

export const DEMOGRAPHIC_TYPES = [
  'race_and_ethnicity',
  'sex',
  'age',
  'lis',
  'eligibility',
  'urbanicity',
  'income',
  'education',
  'insurance_status',
] as const

// union type of array
export type DemographicBreakdownKey = (typeof DEMOGRAPHIC_TYPES)[number]

export const DEMOGRAPHIC_DISPLAY_TYPES: Record<DemographicType, string> = {
  race_and_ethnicity: 'Race and Ethnicity',
  age: 'Age',
  sex: 'Sex',
  fips: 'FIPS Code',
  lis: 'Low income subsidy',
  eligibility: 'Medicare eligibility',
  income: 'Income',
  education: 'Education',
  insurance_status: 'Insurance',
  urbanicity: 'City Size',
} as const

// union type of values (capitalized display names), eg "Race and Ethnicity" | "Age" | "Sex"
export type DemographicTypeDisplayName =
  (typeof DEMOGRAPHIC_DISPLAY_TYPES)[keyof typeof DEMOGRAPHIC_DISPLAY_TYPES]

export const DEMOGRAPHIC_DISPLAY_TYPES_LOWER_CASE: Record<
  DemographicType,
  string
> = {
  race_and_ethnicity: 'race and ethnicity',
  age: 'age',
  sex: 'sex',
  fips: 'FIPs codes',
  lis: 'low income subsidy',
  eligibility: 'eligibility',
  urbanicity: 'city size',
  income: 'income',
  education: 'education',
  insurance_status: 'insurance',
}

interface DemographicBreakdown {
  // Name of the column in the returned data
  readonly columnName: DemographicType
  // Whether the demographic breakdown is requested
  readonly enabled: boolean
  // Filter to apply to the breakdown. If no filter is specified, all available
  // values for that column should be returned.
  readonly filter?: Readonly<BreakdownFilter>
}

function stringifyDemographic(breakdown: DemographicBreakdown) {
  if (!breakdown.enabled) {
    return undefined
  }
  if (!breakdown.filter) {
    return 'no filters'
  }
  const includeStr = breakdown.filter.include ? 'include ' : 'exclude '
  return includeStr + breakdown.filter.values.join()
}

function createDemographicBreakdown(
  columnName: DemographicType,
  enabled = false,
  filter?: BreakdownFilter,
): DemographicBreakdown {
  return {
    columnName,
    enabled,
    filter,
  }
}

export class Breakdowns {
  geography: GeographicBreakdown
  demographicBreakdowns: Record<
    DemographicBreakdownKey,
    Readonly<DemographicBreakdown>
  >

  filterFips?: Fips

  constructor(
    geography: GeographicBreakdown,
    demographicBreakdowns?: Record<
      DemographicBreakdownKey,
      DemographicBreakdown
    >,
    filterFips?: Fips | undefined,
  ) {
    this.geography = geography
    this.demographicBreakdowns = demographicBreakdowns
      ? { ...demographicBreakdowns }
      : {
          race_and_ethnicity: createDemographicBreakdown('race_and_ethnicity'),
          age: createDemographicBreakdown('age'),
          sex: createDemographicBreakdown('sex'),
          lis: createDemographicBreakdown('lis'),
          eligibility: createDemographicBreakdown('eligibility'),
          urbanicity: createDemographicBreakdown('urbanicity'),
          income: createDemographicBreakdown('income'),
          education: createDemographicBreakdown('education'),
          insurance_status: createDemographicBreakdown('insurance_status'),
        }
    this.filterFips = filterFips
  }

  // Returns a string that uniquely identifies a breakdown. Two identical breakdowns will return the same key
  getUniqueKey() {
    const breakdowns: Record<string, any> = {
      geography: this.geography,
      filterFips: this.filterFips ? this.filterFips.code : undefined,
    }
    Object.entries(this.demographicBreakdowns).forEach(
      ([breakdownKey, breakdown]) => {
        breakdowns[breakdownKey] = stringifyDemographic(breakdown)
      },
    )
    // Any fields that are not set will not be included in the string for readability
    // We want to sort these to ensure that it is deterministic so that all breakdowns map to the same key
    const orderedBreakdownKeys = Object.keys(breakdowns)
      .sort()
      .filter((k) => breakdowns[k] !== undefined)
    return orderedBreakdownKeys
      .map((k) => `${k}:${breakdowns[k] as string}`)
      .join(',')
  }

  copy() {
    return new Breakdowns(
      this.geography,
      { ...this.demographicBreakdowns },
      this.filterFips ? new Fips(this.filterFips.code) : undefined,
    )
  }

  static national(): Breakdowns {
    return new Breakdowns('national')
  }

  static byState(): Breakdowns {
    return new Breakdowns('state')
  }

  static byCounty(): Breakdowns {
    return new Breakdowns('county')
  }

  static forFips(fips: Fips): Breakdowns {
    if (fips.isCounty()) {
      return Breakdowns.byCounty().withGeoFilter(fips)
    }

    return fips.isUsa()
      ? Breakdowns.national()
      : Breakdowns.byState().withGeoFilter(fips)
  }

  static forParentFips(fips: Fips): Breakdowns {
    if (fips.isStateOrTerritory()) {
      return Breakdowns.byCounty().withGeoFilter(fips)
    }
    if (fips.isUsa()) {
      return Breakdowns.byState()
    }
    return Breakdowns.forFips(fips)
  }

  static forChildrenFips(fips: Fips): Breakdowns {
    if (fips.isCounty()) {
      return Breakdowns.byCounty().withGeoFilter(fips)
    } else if (fips.isStateOrTerritory()) {
      return Breakdowns.byCounty().withGeoFilter(fips)
    } else {
      return Breakdowns.byState()
    }
  }

  addBreakdown(
    demographicType: DemographicType,
    filter?: BreakdownFilter,
  ): Breakdowns {
    switch (demographicType) {
      case 'race_and_ethnicity':
      case 'age':
      case 'sex':
      case 'lis':
      case 'eligibility':
      case 'urbanicity':
      case 'income':
      case 'education':
      case 'insurance_status':
        // Column name is the same as key
        this.demographicBreakdowns[demographicType] =
          createDemographicBreakdown(demographicType, true, filter)
        return this
      case 'fips':
        throw new Error('Fips breakdown cannot be added')
    }
  }

  andRace(filter?: BreakdownFilter): Breakdowns {
    return this.addBreakdown('race_and_ethnicity', filter)
  }

  andAge(filter?: BreakdownFilter): Breakdowns {
    return this.addBreakdown('age', filter)
  }

  andSex(filter?: BreakdownFilter): Breakdowns {
    return this.addBreakdown('sex', filter)
  }

  // Helper function returning how many demographic breakdowns are currently requested
  demographicBreakdownCount() {
    return Object.entries(this.demographicBreakdowns).filter(
      ([k, v]) => v.enabled,
    ).length
  }

  hasNoDemographicBreakdown() {
    return this.demographicBreakdownCount() === 0
  }

  hasExactlyOneDemographic() {
    return this.demographicBreakdownCount() === 1
  }

  getSoleDemographicBreakdown(): DemographicBreakdown {
    if (!this.hasExactlyOneDemographic()) {
      throw new Error('Invalid assertion of only one demographic breakdown')
    }

    return (
      Object.values(this.demographicBreakdowns).find(
        (breakdown) => breakdown.enabled,
      ) ?? createDemographicBreakdown('race_and_ethnicity')
    )
  }

  hasOnlyRace() {
    return (
      this.hasExactlyOneDemographic() &&
      this.demographicBreakdowns.race_and_ethnicity.enabled
    )
  }

  hasOnlyAge() {
    return (
      this.hasExactlyOneDemographic() && this.demographicBreakdowns.age.enabled
    )
  }

  hasOnlySex() {
    return (
      this.hasExactlyOneDemographic() && this.demographicBreakdowns.sex.enabled
    )
  }

  hasOnlyLis() {
    return (
      this.hasExactlyOneDemographic() && this.demographicBreakdowns.lis.enabled
    )
  }

  hasOnlyEligibility() {
    return (
      this.hasExactlyOneDemographic() &&
      this.demographicBreakdowns.eligibility.enabled
    )
  }

  hasOnlyInsuranceStatus() {
    return (
      this.hasExactlyOneDemographic() &&
      this.demographicBreakdowns.insurance_status.enabled
    )
  }

  hasOnlyIncome() {
    return (
      this.hasExactlyOneDemographic() &&
      this.demographicBreakdowns.income.enabled
    )
  }

  hasOnlyEducation() {
    return (
      this.hasExactlyOneDemographic() &&
      this.demographicBreakdowns.education.enabled
    )
  }

  hasOnlyCitySize() {
    return (
      this.hasExactlyOneDemographic() &&
      this.demographicBreakdowns.urbanicity.enabled
    )
  }

  hasOneRegionOfGeographicGranularity(): boolean {
    switch (this.geography) {
      case 'county':
        return !!this.filterFips && this.filterFips.isCounty()
      case 'state':
        return !!this.filterFips && this.filterFips.isStateOrTerritory()
      case 'territory':
        return !!this.filterFips && this.filterFips.isStateOrTerritory()
      case 'state/territory':
        return !!this.filterFips && this.filterFips.isStateOrTerritory()
      case 'national':
        return !this.filterFips || this.filterFips.isUsa()
    }
  }

  /** Filters to entries that exactly match the specified FIPS code. */
  withGeoFilter(fips: Fips): Breakdowns {
    this.filterFips = fips
    return this
  }

  getJoinColumns(): DemographicType[] {
    const joinCols: DemographicType[] = ['fips']
    Object.entries(this.demographicBreakdowns).forEach(
      ([key, demographicBreakdown]) => {
        if (demographicBreakdown.enabled) {
          joinCols.push(demographicBreakdown.columnName)
        }
      },
    )
    return joinCols.sort()
  }
}
