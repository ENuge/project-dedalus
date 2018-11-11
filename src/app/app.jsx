// @flow

import '@babel/polyfill';
import React from 'react';
import {renderToString} from 'react-dom/server';
import express from 'express';
import type {$Request, $Response} from 'express';

import ReactBase from '../client/ReactBase';
import htmlTemplate from '../client/template';
import handleQotd from './qotd';
import {getStrava, hydrateStrava, postStrava} from './strava';
// import {getAnki, postAnki} from './anki';

const app = express();

app.use(express.json());

const handleRender = (req: $Request, res: $Response) => {
  // res.writeHead(200, { 'Content-Type': 'text/plain' });
  const reactRenderedHtml = renderToString(<ReactBase />);
  const document = htmlTemplate(reactRenderedHtml);
  res.send(document);
};

app.get('/', handleRender);

app.get('/ajax/foo', (req: $Request, res: $Response) => res.send('hi'));

app.get('/ajax/qotd', handleQotd);

app.get('/ajax/strava', getStrava);
app.get('/ajax/strava_details', hydrateStrava);
app.post('/ajax/strava', postStrava);

// TODO: Eventually I will get to implementing these.
// app.get('/ajax/anki', getAnki);
// app.post('/ajax/anki', postAnki);

app.use('/public', express.static('public'));

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT);
