import { useCallback, useState } from 'react'

const STORAGE_KEY = 'het-recent-locations'
const MAX_RECENT = 5

export interface RecentLocation {
  code: string
  displayName: string
}

export function useRecentLocations() {
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>(
    () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? (parsed as RecentLocation[]) : []
      } catch {
        return []
      }
    },
  )

  // Reads from localStorage directly so concurrent instances (compare mode)
  // don't overwrite each other with stale React state.
  const addRecentLocation = useCallback((code: string, displayName: string) => {
    let current: RecentLocation[] = []
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) current = parsed as RecentLocation[]
      }
    } catch {
      // corrupted storage — start fresh
    }
    try {
      const next = [
        { code, displayName },
        ...current.filter((loc) => loc.code !== code),
      ].slice(0, MAX_RECENT)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setRecentLocations(next)
    } catch {
      // localStorage unavailable
    }
  }, [])

  const clearRecentLocations = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // localStorage unavailable
    }
    setRecentLocations([])
  }, [])

  return { recentLocations, addRecentLocation, clearRecentLocations }
}
