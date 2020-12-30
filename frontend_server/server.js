'use strict';

const express = require('express');
const path = require('path');
const basicAuth = require('express-basic-auth');
const { createProxyMiddleware } = require('http-proxy-middleware');

const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();

// TODO should this go before or after basic auth?
// TODO validate options. secure option?
const apiProxyOptions = {
  // TODO make this dynamic
  target: 'https://aaronsn-dataserver-7sw5w4cpba-uc.a.run.app',
  // target: 'https://data-server-service-zarv4pcejq-uc.a.run.app',
  changeOrigin: true, // needed for virtual hosted sites
  ws: true, // proxy websockets
  pathRewrite: { '^/api': '' },
  // router: {
  //   // when request.headers.host == 'dev.localhost:3000',
  //   // override target 'http://www.example.org' to 'http://localhost:8000'
  //   'dev.localhost:3000': 'http://localhost:8000',
  // },
  onProxyReq: function onProxyReq(proxyReq, req, res) {
    // Log outbound request to remote target
    console.log("Connecting to data server");
    console.log('-->  ', req.method, req.path, '->', proxyReq.baseUrl + proxyReq.path);
  },
  onError: function onError(err, req, res) {
    console.log("Error connecting to data server");
    console.error(err);
  },
};
const apiProxy = createProxyMiddleware(apiProxyOptions);
app.use('/api', apiProxy);

// auth middleware must be installed before setting up routes so it applies
// to the whole site.
app.use(basicAuth({
  // Temporary values until we can use Github Secrets. Also needs to be set up
  // so that it's disabled for production but enabled for the test site.
  users: { 'MSM': 'testsite' },
  challenge: true,
  realm: 'Test Site',
}));

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
