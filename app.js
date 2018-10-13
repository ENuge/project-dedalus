// @flow

import React from 'react';
import {renderToString} from 'react-dom/server';
import htmlTemplate from './template';

// [START gae_node_request_example]
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  // res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.send(htmlTemplate('hi!')).end();
});

app.get('/ajax', (req, res) => {
  res.send(JSON.stringify({hello: 'there'})).end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
