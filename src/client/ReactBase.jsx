// @flow
import React from 'react';
import StaticQuote from './components/StaticQuote';
import QuoteOfTheDay from './components/QuoteOfTheDay';
import Strava from './components/Strava';

const ReactBase = () => (
  <React.Fragment>
    <StaticQuote />
    <QuoteOfTheDay />
    <Strava />
  </React.Fragment>
);
export default ReactBase;
