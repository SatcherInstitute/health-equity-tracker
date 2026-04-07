import { Storage } from '@google-cloud/storage'
import compression from 'compression'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
// TODO: change over to use ESModules with import() instead of require() ?
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

const buildDir = process.env['BUILD_DIR'] || 'build'
console.info(`Build directory: ${buildDir}`)

export function assertEnvVar(name) {
  const value = process.env[name]
  console.info(`Environment variable ${name}: ${value ? '[set]' : '[not set]'}`)
  if (value === 'NULL') return ''
  if (!value) {
    throw new Error(
      `Invalid environment variable. Name: ${name}, value: ${value}`,
    )
  }
  return value
}

export function getBooleanEnvVar(name) {
  const value = process.env[name]
  console.info(`Environment variable ${name}: ${value ? '[set]' : '[not set]'}`)
  if (value && value !== 'true' && value !== 'false') {
    throw new Error(
      `Invalid boolean environment variable. Name: ${name}, value: ${value}`,
    )
  }
  return value === 'true'
}

// TODO it would be nice to extract PORT and HOST to environment variables
// because it's good practice not to hard-code this kind of configuration.
const PORT = 8080
const HOST = '0.0.0.0'
const app = express()

app.use(express.json())
app.use(compression())

// CORS middleware
app.use((req, res, next) => {
  // Allow all origins for development or use '*' in non-production environments
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Set standard CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  next()
})

// Add Authorization header for all requests that are proxied to the data server.
// TODO: The token can be cached and only refreshed when needed
app.use('/api', (req, res, next) => {
  if (assertEnvVar('NODE_ENV') === 'production') {
    // Set up metadata server request
    // See https://cloud.google.com/compute/docs/instances/verifying-instance-identity#request_signature
    const metadataServerTokenURL = assertEnvVar('METADATA_SERVER_TOKEN_URL')
    const targetUrl = assertEnvVar('DATA_SERVER_URL')
    const fetchUrl = metadataServerTokenURL + targetUrl
    const options = {
      headers: {
        'Metadata-Flavor': 'Google',
      },
    }
    fetch(fetchUrl, options)
      .then((res) => res.text())
      .then((token) => {
        // Set the bearer token temporarily to Authorization_DataServer header.
        req.headers['Authorization_DataServer'] = `bearer ${token}`
        next()
      })
      .catch(next)
  } else {
    next()
  }
})

// TODO check if these are all the right proxy options. For example, there's a
// "secure" option that makes it check SSL certificates. I don't think we need
// it but I can't find good documentation.
// TODO add logging if there's an error in the request.
const apiProxyOptions = {
  target: assertEnvVar('DATA_SERVER_URL'),
  changeOrigin: true, // needed for virtual hosted sites
  pathRewrite: { '^/api': '' },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader(
      'Authorization',
      proxyReq.getHeader('Authorization_DataServer'),
    )
    proxyReq.removeHeader('Authorization_DataServer')
  },
}
const apiProxy = createProxyMiddleware(apiProxyOptions)
app.use('/api', apiProxy)

app.use(compression())


const ANTHROPIC_API_KEY = assertEnvVar('ANTHROPIC_API_KEY')

// AI Insight Cache
const insightMemoryCache = new Map()
const INSIGHT_TTL_MS = 180 * 24 * 60 * 60 * 1000 // 6 months
const GCS_BUCKET_NAME = process.env['INSIGHTS_CACHE_BUCKET'] ?? null
const gcsClient = GCS_BUCKET_NAME ? new Storage() : null

// Returns the cached insight string if found in GCS and still within TTL,
async function readFromGCS(key) {
  if (!gcsClient) return null
  try {
    const file = gcsClient.bucket(GCS_BUCKET_NAME).file(`insights/${key}.json`)
    const [exists] = await file.exists()
    if (!exists) return null
    const [buffer] = await file.download()
    const { content, timestamp } = JSON.parse(buffer.toString())
    return Date.now() - timestamp < INSIGHT_TTL_MS ? content : null
  } catch (err) {
    console.warn('[insight cache] GCS read error:', err.message)
    return null
  }
}

// Writes a generated insight to GCS
async function writeToGCS(key, content) {
  if (!gcsClient) return
  try {
    await gcsClient
      .bucket(GCS_BUCKET_NAME)
      .file(`insights/${key}.json`)
      .save(JSON.stringify({ content, timestamp: Date.now() }), {
        contentType: 'application/json',
      })
  } catch (err) {
    console.warn('[insight cache] GCS write error:', err.message)
  }
}

app.post('/fetch-ai-insight', async (req, res) => {
  const { prompt, cacheKey: clientCacheKey } = req.body
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt parameter' })
  }

  // Ensure the key is safe to use as a filename in the cloud by removing any special characters.
  const cacheKey = (clientCacheKey ?? prompt).replace(/[^\x20-\x7E]/g, '_').slice(0, 500)
  const now = Date.now()

  // In-memory cache: serve immediately if the entry is within TTL
  const memEntry = insightMemoryCache.get(cacheKey)
  if (memEntry && now - memEntry.timestamp < INSIGHT_TTL_MS) {
    return res.json({ content: memEntry.content })
  }

  // GCS cache: serve from persistent storage and populate memory cache for subsequent requests
  const gcsContent = await readFromGCS(cacheKey)
  if (gcsContent) {
    insightMemoryCache.set(cacheKey, { content: gcsContent, timestamp: now })
    return res.json({ content: gcsContent })
  }

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (anthropicResponse.status === 429) {
      console.warn('Anthropic API rate limit reached')
      return res.status(429).json({ error: 'Rate limit reached' })
    }

    if (!anthropicResponse.ok) {
      throw new Error(`Anthropic API error: ${anthropicResponse.statusText}`)
    }

    const responseBody = await anthropicResponse.json()
    const insightText = (responseBody.content?.[0]?.text || 'No content returned').trim()

    insightMemoryCache.set(cacheKey, { content: insightText, timestamp: now })
    await writeToGCS(cacheKey, insightText)

    res.json({ content: insightText })
  } catch (err) {
    console.error('Error fetching AI insight:', err)
    res.status(500).json({ error: 'Failed to fetch AI insight' })
  }
})

// Indicates whether you have reached the usage limit for the Anthropic API. A value is always returned,
// but the system does not yet track API usage; this functionality will be added in the future.
app.get('/rate-limit-status', (_req, res) => {
  res.json({ rateLimitReached: false })
})

const __dirname = dirname(fileURLToPath(import.meta.url))

// Serve static files from the build directory.
app.use(express.static(path.join(__dirname, buildDir)))

// Route all other paths to index.html. The "*" must be used otherwise
// client-side routing wil fail due to missing exact matches. For more info, see
// https://create-react-app.dev/docs/deployment/#serving-apps-with-client-side-routing
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, buildDir, 'index.html'))
})

app.listen(PORT, HOST)
console.info(`Running on http://${HOST}:${PORT}`)