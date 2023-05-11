import axios from 'axios'

// WORDPRESS CONFIG
export const NEWS_URL = 'https://hetblog.dreamhosters.com/'
export const WP_API = 'wp-json/wp/v2/' // "?rest_route=/wp/v2/"
export const ALL_POSTS = 'posts'
export const ALL_MEDIA = 'media'
export const ALL_CATEGORIES = 'categories'
export const ALL_AUTHORS = 'authors'
export const ALL_PAGES = 'pages' // for dynamic copy
export const WP_EMBED_PARAM = '_embed'
export const WP_PER_PAGE_PARAM = 'per_page='
export const MAX_FETCH = 100

// PAGE IDS FOR WORDPRESS DYNAMIC COPY
export const WIHE_PAGE_ID = 37 // hard coded id where dynamic copy is stored

// REACT QUERY
export const ARTICLES_KEY = 'cached_wp_articles'
export const ARTICLES_KEY_4 = 'cached_wp_articles_first_four'
export const DYNAMIC_COPY_KEY = 'cached_wp_dynamic_copy'
export const REACT_QUERY_OPTIONS = {
  cacheTime: 1000 * 60 * 5, // never garbage collect, always default to cache
  staleTime: 1000 * 30, // treat cache data as fresh and don't refetch
}

export async function fetchNewsData() {
  return await axios.get(
    `${
      NEWS_URL + WP_API + ALL_POSTS
    }?${WP_EMBED_PARAM}&${WP_PER_PAGE_PARAM}${MAX_FETCH}`
  )
}

export async function fetchLandingPageNewsData() {
  return await axios.get(
    `${
      NEWS_URL + WP_API + ALL_POSTS
    }?${WP_EMBED_PARAM}&${WP_PER_PAGE_PARAM}${4}`
  )
}

export async function fetchCopyData() {
  return await axios.get(`${NEWS_URL + WP_API + ALL_PAGES}/${WIHE_PAGE_ID}`)
}
