'use strict';

const express = require('express');
const compression = require('compression')
const path = require('path');
const basicAuth = require('express-basic-auth');
const { createProxyMiddleware } = require('http-proxy-middleware');
// To make non-proxied request to metadata server for service account token.
const fetch = require('node-fetch');

function assertEnvVar(name) {
  const value = import.meta.env[name];
  console.log(`Environment variable ${name}: ${value}`);
  if (!value) {
    throw new Error(
      `Invalid environment variable. Name: ${name}, value: ${value}`);
  }
  return value;
}

function getBooleanEnvVar(name) {
  const value = import.meta.env[name];
  console.log(`Environment variable ${name}: ${value}`);
  if (value && value !== "true" && value !== "false") {
    throw new Error(
      `Invalid boolean environment variable. Name: ${name}, value: ${value}`);
  }
  return value === "true";
}

// TODO it would be nice to extract PORT and HOST to environment variables
// because it's good practice not to hard-code this kind of configuration.
const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();

app.use(compression())

// Add Authorization header for all requests that are proxied to the data server.
// TODO: The token can be cached and only refreshed when needed
app.use('/api', (req, res, next) => {
  if (assertEnvVar("NODE_ENV") === 'production') {
    // Set up metadata server request
    // See https://cloud.google.com/compute/docs/instances/verifying-instance-identity#request_signature
    const metadataServerTokenURL = 'http://metadata/computeMetadata/v1/instance/service-accounts/default/identity?audience=';
    const targetUrl = assertEnvVar("DATA_SERVER_URL");
    const fetchUrl = metadataServerTokenURL + targetUrl;
    const options = {
      headers: {
        'Metadata-Flavor': 'Google'
      }
    };
    fetch(fetchUrl, options)
      .then(res => res.text())
      .then(token => {
        // Set the bearer token temporarily to Authorization_DataServer header. If BasicAuth is enabled,
        // it will overwrite the Authorization header after the token is fetched. Right before the proxy
        // request is sent, overwrite the Authorization header with the bearer token from the service 
        // account and delete the Authorization_DataServer header. 
        req.headers["Authorization_DataServer"] = `bearer ${token}`;
        next();
      })
      .catch(next);
  } else {
    next();
  }
});

// TODO should this go before or after basic auth?
// TODO check if these are all the right proxy options. For example, there's a
// "secure" option that makes it check SSL certificates. I don't think we need
// it but I can't find good documentation.
// TODO add logging if there's an error in the request.
const apiProxyOptions = {
  target: assertEnvVar("DATA_SERVER_URL"),
  changeOrigin: true, // needed for virtual hosted sites
  pathRewrite: { '^/api': '' },
  onProxyReq: (proxyReq, req, res) => {
    // Replace the basic auth header with the service account token.
    proxyReq.setHeader('Authorization', proxyReq.getHeader('Authorization_DataServer'));
    proxyReq.removeHeader('Authorization_DataServer');
  }
};
const apiProxy = createProxyMiddleware(apiProxyOptions);
app.use('/api', apiProxy);

// auth middleware must be installed before setting up routes so it applies
// to the whole site.
if (!getBooleanEnvVar("DISABLE_BASIC_AUTH")) {
  const username = assertEnvVar("BASIC_AUTH_USERNAME");
  const password = assertEnvVar("BASIC_AUTH_PASSWORD");
  app.use(basicAuth({
    // Temporary values until we can use Github Secrets. Also needs to be set up
    // so that it's disabled for production but enabled for the test site.
    users: { [username]: password },
    challenge: true,
    realm: 'Health Equity Tracker',
  }));
}

app.use(compression())

// Serve static files from the build directory.
app.use(express.static(path.join(__dirname, 'build')));

// Route all other paths to index.html. The "*" must be used otherwise
// client-side routing wil fail due to missing exact matches. For more info, see
// https://create-react-app.dev/docs/deployment/#serving-apps-with-client-side-routing
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
