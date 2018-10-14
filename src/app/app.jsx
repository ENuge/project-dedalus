// @flow

import React from 'react';
import {renderToString} from 'react-dom/server';

import ReactBase from '../client/ReactBase';
import htmlTemplate from '../client/template';
import handleQotd from './qotd';
import handleStrava from './strava';
import {getAnki, postAnki} from './anki';

const express = require('express');

const app = express();

const handleRender = (req, res) => {
  // res.writeHead(200, { 'Content-Type': 'text/plain' });
  const reactRenderedHtml = renderToString(<ReactBase />);
  const document = htmlTemplate(reactRenderedHtml);
  res.send(document);
};

app.get('/', handleRender);

app.get('/ajax/qotd', handleQotd);

app.get('/ajax/strava', handleStrava);

app.get('/ajax/anki', getAnki);
app.post('/ajax/anki', postAnki);

app.use('/public', express.static('public'));

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT);
