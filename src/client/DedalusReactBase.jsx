// @flow
import React from 'react';
import QuoteOfTheDay from './components/QuoteOfTheDay';
import Strava from './components/Strava/Strava';
import Header from './components/dedalus/Header';
import Footer from './components/dedalus/Footer';

const DedalusReactBase = () => (
  <React.Fragment>
    <Header />
    <div className="content">
      <QuoteOfTheDay />
      <Strava />
    </div>
    <Footer />
  </React.Fragment>
);
export default DedalusReactBase;
