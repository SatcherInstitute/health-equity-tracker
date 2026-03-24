const API_ENDPOINT = '/fetch-ai-insight'
export const ERROR_GENERATING_INSIGHT = 'Error generating insight'

export type InsightResult = {
  content: string
  rateLimited: boolean
  error?: boolean
}

export async function fetchAIInsight(
  prompt: string,
  imageBase64?: string,
): Promise<InsightResult> {
  const baseApiUrl = import.meta.env.VITE_BASE_API_URL
  const dataServerUrl = baseApiUrl
    ? `${baseApiUrl}${API_ENDPOINT}`
    : API_ENDPOINT

  try {
    const dataResponse = await fetch(dataServerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, imageBase64 }),
    })

    if (dataResponse.status === 429) {
      return { content: '', rateLimited: true }
    }

    if (!dataResponse.ok) {
      throw new Error(`Failed to fetch AI insight: ${dataResponse.statusText}`)
    }

    const insight = await dataResponse.json()
    if (!insight.content) {
      throw new Error('No content returned from AI service')
    }

    return { content: insight.content.trim(), rateLimited: false }
  } catch {
    return { content: '', rateLimited: false, error: true }
  }
}
