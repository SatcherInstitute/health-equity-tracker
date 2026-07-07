import { getEnvironment } from './globals'

// WEBFLOW CONFIG
export const SATCHER_NEWS_PAGE = 'https://satcherinstitute.org/news'
export const SATCHER_HET_NEWS_TAB = SATCHER_NEWS_PAGE + '#het'

// REACT QUERY
export const ARTICLES_KEY_WEBFLOW = 'cached_webflow_het_news'
export const REACT_QUERY_OPTIONS = {
  staleTime: 1000 * 30,
}

export async function fetchHetNewsData() {
  const environment = getEnvironment()
  const hetNewsEndpoint = `${environment.getBaseApiUrl()}/het-news`
  const response = await fetch(hetNewsEndpoint)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const { articles } = await response.json()
  return articles
}
