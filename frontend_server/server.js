'use strict';

const express = require('express');
const path = require('path');
const basicAuth = require('express-basic-auth')

const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();

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
