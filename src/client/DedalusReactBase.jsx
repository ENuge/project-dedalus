// @flow
import React from 'react';
import QuoteOfTheDay from './components/QuoteOfTheDay';
import Strava from './components/Strava/Strava';
import Footer from './components/dedalus/Footer';
import Header from './components/dedalus/Header';
import ParisCountdown from './components/dedalus/ParisCountdown';

const DedalusReactBase = () => (
  <React.Fragment>
    <Header />
    <div className="content">
      <QuoteOfTheDay />
      <ParisCountdown />
      <Strava />
    </div>
    <Footer />
  </React.Fragment>
);
export default DedalusReactBase;
