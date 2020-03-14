// @flow

import React from 'react';

const treatAsUTC = (date: Date) => {
  var result = new Date(date);
  result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
  return result;
};

const daysBetween = (startDate: Date, endDate: Date) => {
  var millisecondsPerDay = 24 * 60 * 60 * 1000;
  return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
};

const daysUntilParisMarathon = Math.ceil(daysBetween(new Date(), new Date(2020, 3, 5)));

const ParisCountdown = () => <div id="ParisCountdown">{daysUntilParisMarathon} Days Remaining</div>;

export default ParisCountdown;
