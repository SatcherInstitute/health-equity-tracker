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

interface WIHEWordpressCopy {
  section2_headingLevel2: string
  section4_headingLevel2: string
  section4_heading2_text: string
  section4_a_headingLevel3: string
  section4_a_heading3_text: string
  section4_a_heading3_link: {
    title: string
    url: string
    target: string
  }
  section4_b_headingLevel3: string
  section4_b_heading3_text: string
  section4_b_heading3_link: {
    title: string
    url: string
    target: string
  }
  section4_c_headingLevel3: string
  section4_c_heading3_text: string
}

/*
Some of the copy for this tab page is loaded from https://hetblog.dreamhosters.com/wp-json/wp/v2/pages/37
The object below provides fallback if that fetch fails
*/

export const WIHEFallbackCopy: WIHEWordpressCopy = {
  section2_headingLevel2: 'Health equity learning',
  section4_headingLevel2: 'How do I join the movement?',
  section4_heading2_text:
    'To advance health equity, we need smart, talented, passionate folks like you on board.',
  section4_a_headingLevel3: 'Learn to create actionable solutions',
  section4_a_heading3_text:
    'Apply to our Political Determinants of Health Learning Laboratory Fellowship. We seek to partner and support diverse groups in building equitable and sustainable pathways for healthy communities.',
  section4_a_heading3_link: {
    title: 'Learn More',
    url: 'https://satcherinstitute.org/programs/political-determinants-of-health-learning-laboratory-program/',
    target: '_blank',
  },
  section4_b_headingLevel3: 'Give back to your community',
  section4_b_heading3_text:
    'Are you a community leader interested in expanding transportation access to vaccine sites within your community? Complete our inquiry form to receive information on our vaccine rideshare efforts and opportunities.',
  section4_b_heading3_link: {
    title: 'Sign Up*',
    url: 'https://satcherinstitute.org/uberrideshare/',
    target: '_blank',
  },
  section4_c_headingLevel3: 'Sign up for our newsletter',
  section4_c_heading3_text:
    'Want updates on the latest news in health equity? Sign up for our Satcher Health Leadership Institute newsletter.',
}
