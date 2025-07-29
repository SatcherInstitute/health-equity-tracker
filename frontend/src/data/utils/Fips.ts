import type { GeographicBreakdown } from '../query/Breakdowns'
import {
  ISLAND_AREAS_FIPS,
  TERRITORY_CODES,
  USA_FIPS,
} from './ConstantsGeography'
import { COUNTY_FIPS_MAP, INDEPENDENT_CITIES, STATE_FIPS_MAP } from './FipsData'

export function isFipsString(code: string): boolean {
  /* NOTE: Tried testing for presense of the string key in the state and county objects below, but it caused a noticeable slowdown as the location dropdown is creating a FIPS instance for every single entry */
  const STATE_FIPS_REGEX = /^[0-9]{2}$/
  const COUNTY_FIPS_REGEX = /^[0-9]{5}$/

  return STATE_FIPS_REGEX.test(code) || COUNTY_FIPS_REGEX.test(code)
}

export function failInvalidFips(code: string) {
  if (!isFipsString(code)) throw new Error(`Invalid FIPS code: ${code}`)
}

class Fips {
  code: string
  constructor(code: string) {
    failInvalidFips(code)
    this.code = code
  }

  isUsa() {
    return this.code === USA_FIPS
  }

  isStateOrTerritory() {
    return !this.isCounty() && !this.isUsa()
  }

  isState() {
    return (
      this.isStateOrTerritory() &&
      !Object.keys(TERRITORY_CODES).includes(this.code)
    )
  }

  isTerritory() {
    return (
      this.isStateOrTerritory() &&
      Object.keys(TERRITORY_CODES).includes(this.code)
    )
  }

  isIslandArea() {
    return ISLAND_AREAS_FIPS.includes(this.code.slice(0, 2))
  }

  isCounty() {
    return this.code.length === 5
  }

  getFipsTypeDisplayName(): GeographicBreakdown | undefined {
    if (this.isUsa()) {
      return 'national'
    } else if (this.isState()) {
      return 'state'
    } else if (this.isTerritory()) {
      return 'territory'
    } else if (this.isCounty()) {
      return 'county'
    }
  }

  getUppercaseFipsTypeDisplayName() {
    if (this.isUsa()) {
      return 'National'
    } else if (this.isState()) {
      return 'State'
    } else if (this.isTerritory()) {
      return 'Territory'
    } else if (this.isCounty()) {
      return 'County'
    }
  }

  getChildFipsTypeDisplayName() {
    if (this.isUsa()) {
      return 'state/territory'
    } else if (this.isState()) {
      return 'county'
    } else if (this.isTerritory()) {
      return 'county equivalent'
    } else {
      return ''
    }
  }

  getFipsCategory(): string {
    if (this.isUsa()) return 'National'
    if (this.isState()) return 'States'
    if (this.isTerritory()) return 'Territories'
    return `${this.getParentFips().getDisplayName()} ${
      this.getParentFips().isTerritory() ? 'County Equivalents' : 'Counties'
    }`
  }

  getPluralChildFipsTypeDisplayName() {
    if (this.isUsa()) {
      return 'states/territories'
    } else if (this.isState()) {
      return 'counties'
    } else if (this.isTerritory()) {
      return 'county equivalents'
    } else {
      return ''
    }
  }

  getDisplayName() {
    // USA or STATE
    if (!this.isCounty()) return STATE_FIPS_MAP[this.code]
    // COUNTY EQUIVALENTS (FROM TERRITORIES)
    if (this.getParentFips().isTerritory()) {
      return `${COUNTY_FIPS_MAP[this.code]}`
    }
    // COUNTIES (with the word COUNTY added as needed)
    let optionalCounty =
      COUNTY_FIPS_MAP[this.code].includes('Borough') ||
      COUNTY_FIPS_MAP[this.code].includes('Census Area') ||
      COUNTY_FIPS_MAP[this.code].includes('District') ||
      COUNTY_FIPS_MAP[this.code].endsWith(' County') ||
      this.isIndependentCity()
        ? ''
        : ' County'

    if (this.code.startsWith('22')) optionalCounty = ' Parish'

    return `${COUNTY_FIPS_MAP[this.code]}${optionalCounty}`
  }

  getFullDisplayName() {
    return `${this.getDisplayName()}${
      this.isCounty() ? `, ${this.getStateDisplayName()}` : ''
    }`
  }

  getSentenceDisplayName() {
    return `${this.isUsa() ? 'the ' : ''}${this.getFullDisplayName()}`
  }

  getStateFipsCode() {
    return this.code.substring(0, 2)
  }

  getStateDisplayName() {
    return STATE_FIPS_MAP[this.getStateFipsCode()]
  }

  getParentFips() {
    return this.isCounty()
      ? new Fips(this.code.substring(0, 2))
      : new Fips(USA_FIPS)
  }

  isParentOf(countyFipsCode: string) {
    return countyFipsCode.substring(0, 2) === this.code
  }

  isIndependentCity() {
    return INDEPENDENT_CITIES.includes(this.code)
  }
}

export { Fips }
