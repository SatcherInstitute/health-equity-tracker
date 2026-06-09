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
        return raw ? (JSON.parse(raw) as RecentLocation[]) : []
      } catch {
        return []
      }
    },
  )

  // Reads from localStorage directly so concurrent instances (compare mode)
  // don't overwrite each other with stale React state.
  const addRecentLocation = useCallback((code: string, displayName: string) => {
    try {
      const current = JSON.parse(
        localStorage.getItem(STORAGE_KEY) ?? '[]',
      ) as RecentLocation[]
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

  return { recentLocations, addRecentLocation }
}
