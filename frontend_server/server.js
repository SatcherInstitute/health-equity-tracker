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

app.use(compression())

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
  onProxyReq: (proxyReq, req, res) => {
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
