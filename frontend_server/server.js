import compression from 'compression'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
// TODO: change over to use ESModules with import() instead of require() ?
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

const buildDir = process.env['BUILD_DIR'] || 'build'
let RATE_LIMIT_REACHED = false
console.info(`Build directory: ${buildDir}`)

export function assertEnvVar(name) {
  const value = process.env[name]
  console.info(`Environment variable ${name}: ${value}`)
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
  console.info(`Environment variable ${name}: ${value}`)
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

app.get('/rate-limit-status', (req, res) => {
  res.json({
    rateLimitReached: RATE_LIMIT_REACHED,
  })
})

app.post('/fetch-ai-insight', async (req, res) => {
  const prompt = req.body.prompt
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt parameter' })
  }

  const apiKey = assertEnvVar('OPENAI_API_KEY')

  try {
    const aiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
        }),
      },
    )

    if (aiResponse.status === 429) {
      RATE_LIMIT_REACHED = true
      throw new Error('Rate limit reached')
    }

    if (!aiResponse.ok) {
      throw new Error(`AI API Error: ${aiResponse.statusText}`)
    }

    const json = await aiResponse.json()
    const content = json.choices?.[0]?.message?.content || 'No content returned'

    res.json({ content: content.trim() })
  } catch (err) {
    console.error('Error fetching AI insight:', err)

    if (err.message.includes('Rate limit')) {
      res.status(429).json({ error: 'Rate limit reached' })
    } else {
      res.status(500).json({ error: 'Failed to fetch AI insight' })
    }
  }
})

// Serve static files from the build directory.
const __dirname = dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.join(__dirname, buildDir)))

// Route all other paths to index.html. The "*" must be used otherwise
// client-side routing wil fail due to missing exact matches. For more info, see
// https://create-react-app.dev/docs/deployment/#serving-apps-with-client-side-routing
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, buildDir, 'index.html'))
})

app.listen(PORT, HOST)
console.info(`Running on http://${HOST}:${PORT}`)
