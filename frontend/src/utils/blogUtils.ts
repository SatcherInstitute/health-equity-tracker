import { getEnvironment } from './globals'

// WORDPRESS CONFIG
const NEWS_URL = 'https://hetblog.dreamhosters.com/'
const WP_API = 'wp-json/wp/v2/'
const ALL_POSTS = 'posts'
const WP_EMBED_PARAM = '_embed'
const WP_PER_PAGE_PARAM = 'per_page='
const MAX_FETCH = 100

// REACT QUERY
export const ARTICLES_KEY = 'cached_wp_articles'
export const ARTICLES_KEY_4 = 'cached_wp_articles_first_four'
export const ARTICLES_KEY_WEBFLOW = 'cached_webflow_het_news'
export const REACT_QUERY_OPTIONS = {
  cacheTime: 1000 * 60 * 5,
  staleTime: 1000 * 30,
}

async function handleFetchResponse(response: Response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  return { data }
}

export async function fetchNewsData() {
  const response = await fetch(
    `${NEWS_URL + WP_API + ALL_POSTS}?${WP_EMBED_PARAM}&${WP_PER_PAGE_PARAM}${MAX_FETCH}`,
  )
  return handleFetchResponse(response)
}

export async function fetchLandingPageNewsData() {
  const response = await fetch(
    `${NEWS_URL + WP_API + ALL_POSTS}?${WP_EMBED_PARAM}&${WP_PER_PAGE_PARAM}5`,
  )
  return handleFetchResponse(response)
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
