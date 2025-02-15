export const USA_DISPLAY_NAME = 'United States'
// Fake FIPS code used to represent totals in USA for convenience
export const USA_FIPS = '00'
export const GEORGIA_FIPS = '13'

// Fips code for District of Columbia (state equivalent and county equivalent).
export const DC = '11'
export const DC_COUNTY_FIPS = '11001'

// Territories
export const AMERICAN_SAMOA = '60'
export const GUAM = '66'
export const NORTHERN_MARIANA_ISLANDS = '69'
export const PUERTO_RICO = '72'
export const VIRGIN_ISLANDS = '78'
export const TERRITORY_CODES: Record<string, string> = {
  [AMERICAN_SAMOA]: 'AS',
  [GUAM]: 'GU',
  [NORTHERN_MARIANA_ISLANDS]: 'MP',
  [PUERTO_RICO]: 'PR',
  [VIRGIN_ISLANDS]: 'VI',
  [DC]: 'DC',
}
export const ISLAND_AREAS_FIPS = [
  GUAM,
  VIRGIN_ISLANDS,
  NORTHERN_MARIANA_ISLANDS,
  AMERICAN_SAMOA,
]
