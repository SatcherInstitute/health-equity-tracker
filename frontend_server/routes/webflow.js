import express from 'express'
import { assertEnvVar } from '../utils.js'

const router = express.Router()

const WEBFLOW_API_TOKEN = assertEnvVar('WEBFLOW_API_TOKEN')
const WEBFLOW_NEWS_COLLECTION_ID = '6811154eaf44a4127de5c768'
const WEBFLOW_TAGS_COLLECTION_ID = '681260687cb93bd6bf4f782f'
const HET_ORG_ID = 'ae155e605db764fb19ba82c7a5b4ac26'
const WEBFLOW_BASE = 'https://api.webflow.com/v2'
const WEBFLOW_HEADERS = {
  Authorization: `Bearer ${WEBFLOW_API_TOKEN}`,
  accept: 'application/json',
}

// Cache State
let tagCache = null
let lastFetchTime = 0
const CACHE_TTL = 60 * 60 * 1000 // 1 Hour

/**
 * Fetches the tag mapping from Webflow.
 * @param {boolean} forceRefresh - If true, ignores TTL and fetches fresh data.
 */
async function getTagMap(forceRefresh = false) {
  const now = Date.now()

  if (!forceRefresh && tagCache && (now - lastFetchTime < CACHE_TTL)) {
    return tagCache
  }

  try {
    const res = await fetch(`${WEBFLOW_BASE}/collections/${WEBFLOW_TAGS_COLLECTION_ID}/items`, {
      headers: WEBFLOW_HEADERS
    })

    if (!res.ok) {
      // If refresh fails but we have old data, prefer stale data over a crash
      if (tagCache) {
        console.warn('[webflow-tags] API error, serving stale cache')
        return tagCache
      }
      throw new Error(`Webflow Tags API error: ${res.statusText}`)
    }

    const data = await res.json()
    tagCache = Object.fromEntries((data.items || []).map((item) => [item.id, item.fieldData.name]))
    lastFetchTime = now
    console.info('[webflow-tags] Cache updated successfully')
    return tagCache
  } catch (err) {
    if (tagCache) return tagCache
    throw err
  }
}

router.get('/het-news', async (req, res) => {
  try {
    // 1. Initial fetch of tags and news items
    let [tagMap, itemsRes] = await Promise.all([
      getTagMap(),
      fetch(`${WEBFLOW_BASE}/collections/${WEBFLOW_NEWS_COLLECTION_ID}/items`, {
        headers: WEBFLOW_HEADERS,
      }),
    ])

    // 2. Verify news API success
    if (!itemsRes.ok) {
      throw new Error(`Webflow News API error: ${itemsRes.status} ${itemsRes.statusText}`)
    }

    const data = await itemsRes.json()
    const rawItems = data.items || []

    // 3. Smart Cache Busting:
    // Check if any incoming article uses a tag ID that isn't in our current map.
    const hasUnknownTag = rawItems.some((item) =>
      (item.fieldData.tags ?? []).some((id) => !tagMap[id])
    )

    if (hasUnknownTag) {
      console.info('[webflow-news] Unknown tag detected. Busting tag cache...')
      tagMap = await getTagMap(true)
    }

    // 4. Transform and Filter Data
    const articles = rawItems
      .filter((item) => item.fieldData['primary-org'] === HET_ORG_ID)
      .sort((a, b) => new Date(b.fieldData.date || 0) - new Date(a.fieldData.date || 0))
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
          thumbnail: imageUrl ? (imageUrl.includes('?') ? imageUrl + '&w=400' : imageUrl + '?w=400') : null,
        }
      })

    res.json({ articles })
  } catch (err) {
    console.error('[webflow-news] Error fetching news:', err)
    res.status(500).json({ error: 'Failed to fetch news articles' })
  }
})

export default router