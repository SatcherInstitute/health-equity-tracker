import express from 'express'
import { assertEnvVar } from '../utils.js'

const router = express.Router()

/** * Configuration Constants
 * Using the CDN endpoint for improved performance and higher rate limits.
 */
const WEBFLOW_API_TOKEN = assertEnvVar('WEBFLOW_API_TOKEN')
const WEBFLOW_NEWS_COLLECTION_ID = '6811154eaf44a4127de5c768'
const WEBFLOW_TAGS_COLLECTION_ID = '681260687cb93bd6bf4f782f'
const HET_ORG_ID = 'ae155e605db764fb19ba82c7a5b4ac26'
const WEBFLOW_BASE = 'https://api-cdn.webflow.com/v2'

const WEBFLOW_HEADERS = {
  Authorization: `Bearer ${WEBFLOW_API_TOKEN}`,
  accept: 'application/json',
}

/** * Cache State
 * TTL-based caching to minimize external API latency and stay within rate limits.
 */
let tagCache = null
let tagFetchTime = 0
let newsCache = null
let newsFetchTime = 0

const TAG_TTL = 60 * 60 * 1000  // 1 Hour
const NEWS_TTL = 5 * 60 * 1000  // 5 Minutes

/**
 * Retrieves tag metadata from Webflow.
 * Implements a stale-if-error pattern to ensure service availability.
 * @param {boolean} forceRefresh - If true, bypasses the local TTL cache.
 * @returns {Promise<Object>} Map of tag IDs to display names.
 */
async function getTagMap(forceRefresh = false) {
  const now = Date.now()
  if (!forceRefresh && tagCache && (now - tagFetchTime < TAG_TTL)) {
    return tagCache
  }

  try {
    const res = await fetch(`${WEBFLOW_BASE}/collections/${WEBFLOW_TAGS_COLLECTION_ID}/items`, {
      headers: WEBFLOW_HEADERS
    })

    if (!res.ok) throw new Error(`Tags API error: ${res.statusText}`)

    const data = await res.json()
    tagCache = Object.fromEntries(data.items.map((item) => [item.id, item.fieldData.name]))
    tagFetchTime = now
    return tagCache
  } catch (err) {
    // Return stale cache if available, otherwise propagate error
    if (tagCache) {
      console.warn('[webflow-tags] API unreachable, serving stale cache.')
      return tagCache
    }
    throw err
  }
}

/**
 * GET /het-news
 * Retrieves the latest 3 news articles filtered by organization.
 */
router.get('/het-news', async (req, res) => {
  const now = Date.now()

  // Serve from cache if within TTL
  if (newsCache && (now - newsFetchTime < NEWS_TTL)) {
    return res.json({ articles: newsCache })
  }

  try {
    // Parallel fetch of tag metadata and news items
    let [tagMap, itemsRes] = await Promise.all([
      getTagMap(),
      fetch(`${WEBFLOW_BASE}/collections/${WEBFLOW_NEWS_COLLECTION_ID}/items`, {
        headers: WEBFLOW_HEADERS,
      }),
    ])

    if (!itemsRes.ok) {
      throw new Error(`News API error: ${itemsRes.status} ${itemsRes.statusText}`)
    }

    const data = await itemsRes.json()
    const rawItems = data.items || []

    /**
     * Lazy Cache Invalidation:
     * If an item contains a tag ID missing from our cache, trigger an
     * immediate refresh of the tag metadata.
     */
    const hasUnknownTag = rawItems.some((item) =>
      (item.fieldData.tags ?? []).some((id) => !tagMap[id])
    )

    if (hasUnknownTag) {
      tagMap = await getTagMap(true)
    }

    // Process and format articles
    const articles = rawItems
      .filter((item) => item.fieldData['primary-org'] === HET_ORG_ID)
      .sort((a, b) => new Date(b.fieldData.date) - new Date(a.fieldData.date))
      .slice(0, 3)
      .map((item) => {
        const f = item.fieldData
        const imageUrl = f['main-image']?.url
        return {
          title: f.name,
          author: f.author ?? null,
          date: f.date,
          tags: (f.tags ?? []).map((id) => tagMap[id] ?? id),
          slug: f.slug,
          summary: f['post-summary'] ?? null,
          thumbnail: imageUrl ? imageUrl.replace(/(\.\w+)(\?.*)?$/, '-p-500$1$2') : null, // fetch 500px wide version
        }
      })

    // Update news cache
    newsCache = articles
    newsFetchTime = now

    res.json({ articles })
  } catch (err) {
    console.error('[webflow-news] Error processing request:', err)

    // Recovery attempt: serve last known good data
    if (newsCache) {
      console.info('[webflow-news] Serving stale news articles after error.')
      return res.json({ articles: newsCache })
    }

    res.status(500).json({ error: 'Internal server error while fetching news articles.' })
  }
})

export default router