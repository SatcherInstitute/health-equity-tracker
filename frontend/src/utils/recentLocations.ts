import { Fips } from '../data/utils/Fips'

export type GroupKey = 'Recent' | 'National' | 'States' | 'Territories'

export const RECENT_LOCATIONS_KEY: GroupKey = 'Recent'

const MAX_RECENT_LOCATIONS = 5

export function getRecentLocations(): Fips[] {
  try {
    const stored = localStorage.getItem(RECENT_LOCATIONS_KEY)
    if (!stored) return []
    const fipsCodes = JSON.parse(stored) as string[]
    return fipsCodes.map((code) => new Fips(code))
  } catch (e) {
    console.error('Error reading recent locations:', e)
    return []
  }
}

export function addRecentLocation(fips: Fips) {
  try {
    const recent = getRecentLocations()
    const filtered = recent.filter((f) => f.code !== fips.code)
    filtered.unshift(fips)
    const trimmed = filtered.slice(0, MAX_RECENT_LOCATIONS)
    localStorage.setItem(
      RECENT_LOCATIONS_KEY,
      JSON.stringify(trimmed.map((f) => f.code)),
    )
  } catch (e) {
    console.error('Error saving recent location:', e)
  }
}

export function clearRecentLocations() {
  try {
    localStorage.removeItem(RECENT_LOCATIONS_KEY)
  } catch (e) {
    console.error('Error clearing recent locations:', e)
  }
}
