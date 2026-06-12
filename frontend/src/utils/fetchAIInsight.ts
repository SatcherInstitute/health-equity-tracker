const API_ENDPOINT = '/fetch-ai-insight'
export const ERROR_GENERATING_INSIGHT = 'Error generating insight'

export type InsightResult = {
  content: string
  rateLimited: boolean
  error?: boolean
  suppressed?: boolean
  // The exact server cache key the insight was stored under — needed to flag it.
  cacheKey?: string
}

export type FetchAIInsightOptions = {
  cacheKey?: string
  // Topic identifier (e.g. dataTypeId) used to scope flagged-example negative prompts.
  topic?: string
}

export async function fetchAIInsight(
  prompt: string,
  options?: FetchAIInsightOptions,
): Promise<InsightResult> {
  const baseApiUrl = import.meta.env.VITE_BASE_API_URL
  const dataServerUrl = baseApiUrl
    ? `${baseApiUrl}${API_ENDPOINT}`
    : API_ENDPOINT

  try {
    const dataResponse = await fetch(dataServerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        cacheKey: options?.cacheKey,
        topic: options?.topic,
      }),
    })

    if (dataResponse.status === 429) {
      return { content: '', rateLimited: true }
    }

    if (!dataResponse.ok) {
      throw new Error(`Failed to fetch AI insight: ${dataResponse.statusText}`)
    }

    const insight = await dataResponse.json()
    // The insight has been flagged and suppressed — there is no content to show.
    if (insight.suppressed) {
      return { content: '', rateLimited: false, suppressed: true }
    }
    if (!insight.content) {
      throw new Error('No content returned from AI service')
    }

    return { content: insight.content.trim(), rateLimited: false }
  } catch (error) {
    console.error('Error fetching AI insight:', error)
    return { content: '', rateLimited: false, error: true }
  }
}
