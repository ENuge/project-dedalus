// @flow

import '@babel/polyfill';
import React from 'react';
import {renderToString} from 'react-dom/server';
import express from 'express';
import type {$Request, $Response} from 'express';

import IndexReactBase from '../client/IndexReactBase';
import DedalusReactBase from '../client/DedalusReactBase';
import htmlTemplate from '../client/template';
import handleQotd from './qotd';
import {getStrava, hydrateStrava, postStrava} from './strava';
// import {getAnki, postAnki} from './anki';

const app = express();

app.use(express.json());

const availableTopLevelPages = ['/about', '/coffee', '/tech', '/notes', '/thoughts'];

const handleIndexRender = (req: $Request, res: $Response) => {
  const topLevelPage = req.path.slice(1);
  const reactRenderedHtml = renderToString(<IndexReactBase topLevelPage={topLevelPage} />);
  const document = htmlTemplate(reactRenderedHtml, 'index');
  res.send(document);
};

const handleDedalusRender = (req: $Request, res: $Response) => {
  const reactRenderedHtml = renderToString(<DedalusReactBase />);
  const document = htmlTemplate(reactRenderedHtml, 'dedalus');
  res.send(document);
};

app.get('/', handleIndexRender);
app.get(availableTopLevelPages, handleIndexRender);
app.get('/dedalus', handleDedalusRender);

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
