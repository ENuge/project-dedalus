// @flow
import React from 'react';
import QuoteOfTheDay from './components/QuoteOfTheDay';
import Strava from './components/Strava/Strava';
import Header from './components/Header';
import Footer from './components/Footer';

const ReactBase = () => (
  <React.Fragment>
    <Header />
    <div className="content">
      <QuoteOfTheDay />
      <Strava />
    </div>
    <Footer />
  </React.Fragment>
);
export default ReactBase;
