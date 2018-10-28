// @flow
import React from 'react';
import StaticQuote from './components/StaticQuote';
import QuoteOfTheDay from './components/QuoteOfTheDay';
import Strava from './components/Strava';
import Header from './components/Header';

const ReactBase = () => (
  <React.Fragment>
    <Header />
    <div className="content">
      <StaticQuote />
      <QuoteOfTheDay />
      <Strava />
    </div>
  </React.Fragment>
);
export default ReactBase;
