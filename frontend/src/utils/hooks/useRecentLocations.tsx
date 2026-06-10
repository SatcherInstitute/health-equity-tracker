import { useCallback, useState } from 'react'
import { isFipsString } from '../../data/utils/Fips'

const STORAGE_KEY = 'het-recent-locations'
const MAX_RECENT = 5

function readFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? (parsed as string[]).filter(isFipsString)
      : []
  } catch {
    return []
  }
}

export function useRecentLocations() {
  const [recentLocations, setRecentLocations] =
    useState<string[]>(readFromStorage)

  // Reads from localStorage directly so concurrent instances (compare mode)
  // don't overwrite each other with stale React state.
  const addRecentLocation = useCallback((code: string) => {
    if (!isFipsString(code)) return
    const current = readFromStorage()
    try {
      const next = [code, ...current.filter((c) => c !== code)].slice(
        0,
        MAX_RECENT,
      )
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setRecentLocations(next)
    } catch (e) {
      console.error('useRecentLocations: failed to write to localStorage', e)
    }
  }, [])

  const clearRecentLocations = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      console.error('useRecentLocations: failed to clear localStorage', e)
    }
    setRecentLocations([])
  }, [])

  return { recentLocations, addRecentLocation, clearRecentLocations }
}
