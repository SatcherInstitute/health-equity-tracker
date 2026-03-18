import compression from 'compression'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const buildDir = process.env['BUILD_DIR'] || 'build'
console.info(`Build directory: ${buildDir}`)

export function assertEnvVar(name) {
  const value = process.env[name]
  console.info(`Environment variable ${name}: ${value}`)
  if (value === 'NULL') return ''
  if (!value) {
    throw new Error(`Invalid environment variable. Name: ${name}, value: ${value}`)
  }
  return value
}

export function getBooleanEnvVar(name) {
  const value = process.env[name]
  console.info(`Environment variable ${name}: ${value}`)
  if (value && value !== 'true' && value !== 'false') {
    throw new Error(`Invalid boolean environment variable. Name: ${name}, value: ${value}`)
  }
  return value === 'true'
}

const PORT = 8080
const HOST = '0.0.0.0'
const app = express()

app.use(express.json())
app.use(compression())

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }
  next()
})

app.use('/api', (req, res, next) => {
  if (assertEnvVar('NODE_ENV') === 'production') {
    const metadataServerTokenURL = assertEnvVar('METADATA_SERVER_TOKEN_URL')
    const targetUrl = assertEnvVar('DATA_SERVER_URL')
    const fetchUrl = metadataServerTokenURL + targetUrl
    fetch(fetchUrl, { headers: { 'Metadata-Flavor': 'Google' } })
      .then((res) => res.text())
      .then((token) => {
        req.headers['Authorization_DataServer'] = `bearer ${token}`
        next()
      })
      .catch(next)
  } else {
    next()
  }
})

const apiProxyOptions = {
  target: assertEnvVar('DATA_SERVER_URL'),
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('Authorization', proxyReq.getHeader('Authorization_DataServer'))
    proxyReq.removeHeader('Authorization_DataServer')
  },
}
const apiProxy = createProxyMiddleware(apiProxyOptions)
app.use('/api', apiProxy)

app.use(compression())


const aiInsightCache = new Map()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

app.post('/fetch-ai-insight', async (req, res) => {
  const prompt = req.body.prompt
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt parameter' })
  }

  const now = Date.now()
  const cachedItem = aiInsightCache.get(prompt)
  if (cachedItem && now - cachedItem.timestamp < CACHE_TTL_MS) {
    return res.json({ content: cachedItem.content })
  }

  const apiKey = assertEnvVar('ANTHROPIC_API_KEY')

  try {
    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (aiResponse.status === 429) {
      console.warn('Anthropic API rate limit reached')
      return res.status(429).json({ error: 'Rate limit reached' })
    }

    if (!aiResponse.ok) {
      throw new Error(`AI API Error: ${aiResponse.statusText}`)
    }

    const json = await aiResponse.json()
    const content = json.content?.[0]?.text || 'No content returned'
    const trimmedContent = content.trim()

    // Store in cache with timestamp
    aiInsightCache.set(prompt, { content: trimmedContent, timestamp: now })
    res.json({ content: trimmedContent })
  } catch (err) {
    console.error('Error fetching AI insight:', err)
    res.status(500).json({ error: 'Failed to fetch AI insight' })
  }
})

const __dirname = dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.join(__dirname, buildDir)))
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, buildDir, 'index.html'))
})

app.listen(PORT, HOST)
console.info(`Running on http://${HOST}:${PORT}`)