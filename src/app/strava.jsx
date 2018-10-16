// @flow

import strava from 'strava-v3';
import type {$Request, $Response} from 'express';

// Get data from strava using my API key (read from a local file
// that is not committed to git). Post that, for now, in just a
// raw format. Eventually I want it to be formatted with the ability
// to easily add comments to workouts but we'll work our way to that!

// POST: Allows me to change the name and description of the activity.
// (Description can be useful for summarizing workouts - especially
// if client can prefill based on the type of activity done.)

export const getStrava = async (req: $Request, res: $Response) => {
  console.log('hi!');
  strava.athlete.listActivities({}, (err, payload) => {
    if (!err) {
      res.send(payload);
    } else {
      console.log(`Error receiving response from strava: ${err}`);
    }
  });
};
export const postStrava = (req: $Request, res: $Response) => {
  strava.activities.update({id: req.body.id, description: req.body.description}, (err, payload) => {
    if (err) {
      console.log(`Error updating description in Strava: ${JSON.stringify(err)}`);
      res.send({success: false});
    } else {
      console.log(`Updated Strava activity to: ${JSON.stringify(payload)}`);
      res.send({success: true});
    }
  });
};
