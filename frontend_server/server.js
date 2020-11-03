'use strict';

const express = require('express');
const path = require('path');
const basicAuth = require('express-basic-auth')

const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();

// Make sure to install auth middleware before setting up routes so it applies
// to the whole site.
app.use(basicAuth({
  // Temporary values until we can use Github Secrets. Also needs to only be
  // set up for the test site based on an environment variable.
  users: { 'MSM': 'testsite' },
  challenge: true,
  realm: 'Test Site',
}));


app.use(express.static(path.join(__dirname, 'build')));

app.post('/log_data', (req, res) => {
  console.log('Logged some data');
  res.status(200).json('success');;
});

app.get('/override_react_router', (req, res) => {
  res.send('This is a page that overrides react router');
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
console.log(process.env.MY_ENVIRONMENT_VARIABLE);
