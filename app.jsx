// @flow

import React from 'react';
import {renderToString} from 'react-dom/server';
import htmlTemplate from './template';
import ReactBase from './ReactBase';

// [START gae_node_request_example]
const express = require('express');

const app = express();

const handleRender = (req, res) => {
  // res.writeHead(200, { 'Content-Type': 'text/plain' });
  const reactRenderedHtml = renderToString(<ReactBase />);
  const document = htmlTemplate(reactRenderedHtml);
  res.send(document);
};

app.get('/', handleRender);

app.use('/public', express.static('public'));

// app.get('/ajax', (req, res) => {
//   res.send(JSON.stringify({hello: 'there'})).end();
// });

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT);
