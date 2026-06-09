import { useState } from 'react'

const STORAGE_KEY = 'het-recent-locations'
const MAX_RECENT = 5

interface RecentLocation {
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

  function addRecentLocation(code: string, displayName: string) {
    const next = [
      { code, displayName },
      ...recentLocations.filter((loc) => loc.code !== code),
    ].slice(0, MAX_RECENT)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // localStorage unavailable
    }
    setRecentLocations(next)
  }

  return { recentLocations, addRecentLocation }
}
