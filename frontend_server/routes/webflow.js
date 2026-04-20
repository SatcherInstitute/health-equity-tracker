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

let tagCache = null

async function getTagMap() {
  if (tagCache) return tagCache
  const res = await fetch(`${WEBFLOW_BASE}/collections/${WEBFLOW_TAGS_COLLECTION_ID}/items`, {
    headers: WEBFLOW_HEADERS,
  })
  const data = await res.json()
  tagCache = Object.fromEntries(data.items.map((item) => [item.id, item.fieldData.name]))
  return tagCache
}

router.get('/het-news', async (req, res) => {
  try {
    const [itemsRes, tagMap] = await Promise.all([
      fetch(`${WEBFLOW_BASE}/collections/${WEBFLOW_NEWS_COLLECTION_ID}/items`, {
        headers: WEBFLOW_HEADERS,
      }),
      getTagMap(),
    ])

    const data = await itemsRes.json()

    const articles = data.items
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
          thumbnail: imageUrl ? `${imageUrl}?w=400` : null,
        }
      })

    res.json({ articles })
  } catch (err) {
    console.error('[webflow-news] Error fetching news:', err)
    res.status(500).json({ error: 'Failed to fetch news articles' })
  }
})

export default router