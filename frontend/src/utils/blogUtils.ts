// WORDPRESS CONFIG
export const NEWS_URL = 'https://hetblog.dreamhosters.com/'
export const WP_API = 'wp-json/wp/v2/'
export const ALL_POSTS = 'posts'
export const ALL_MEDIA = 'media'
export const ALL_CATEGORIES = 'categories'
export const ALL_AUTHORS = 'authors'
export const WP_EMBED_PARAM = '_embed'
export const WP_PER_PAGE_PARAM = 'per_page='
export const MAX_FETCH = 100

// REACT QUERY
export const ARTICLES_KEY = 'cached_wp_articles'
export const ARTICLES_KEY_4 = 'cached_wp_articles_first_four'
export const REACT_QUERY_OPTIONS = {
  cacheTime: 1000 * 60 * 5, // never garbage collect, always default to cache
  staleTime: 1000 * 30, // treat cache data as fresh and don't refetch
}

// Utility function to handle fetch responses
async function handleFetchResponse(response: Response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.json()
}

// Fetch all news data
export async function fetchNewsData() {
  const url = `${NEWS_URL + WP_API + ALL_POSTS}?${WP_EMBED_PARAM}&${WP_PER_PAGE_PARAM}${MAX_FETCH}`
  const response = await fetch(url)
  return handleFetchResponse(response)
}

// Fetch landing page news data (first 4 posts)
export async function fetchLandingPageNewsData() {
  const url = `${NEWS_URL + WP_API + ALL_POSTS}?${WP_EMBED_PARAM}&${WP_PER_PAGE_PARAM}4`
  const response = await fetch(url)
  return handleFetchResponse(response)
}
