const API_ENDPOINT = '/flag-insight'

export type FlagReason = 'inaccurate' | 'misleading' | 'offensive' | 'other'

export const FLAG_REASON_OPTIONS: { value: FlagReason; label: string }[] = [
  { value: 'inaccurate', label: 'Inaccurate' },
  { value: 'misleading', label: 'Misleading' },
  { value: 'offensive', label: 'Offensive' },
  { value: 'other', label: 'Other' },
]

export interface FlagInsightParams {
  // The exact server cache key the insight was generated/stored under.
  cacheKey: string
  reason: FlagReason
  note?: string
  // The displayed insight text, stored for team review.
  content?: string
  // Topic identifier (e.g. dataTypeId) so flags can be scoped per topic.
  topic?: string
}

// Reports a problematic AI insight. The data server records the flag and
// clears the cached text so a fresh insight regenerates in place.
// Only the team can escalate to suppressed/hidden via PATCH /flagged-insights.
// Returns true on success.
export async function flagInsight(params: FlagInsightParams): Promise<boolean> {
  const baseApiUrl = import.meta.env.VITE_BASE_API_URL
  const url = baseApiUrl ? `${baseApiUrl}${API_ENDPOINT}` : API_ENDPOINT

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    return response.ok
  } catch (error) {
    console.error('Error flagging insight:', error)
    return false
  }
}
