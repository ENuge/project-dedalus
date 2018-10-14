// @flow

import axios from 'axios';

// Get data from strava using my API key (read from a local file
// that is not committed to git). Post that, for now, in just a
// raw format. Eventually I want it to be formatted with the ability
// to easily add comments to workouts but we'll work our way to that!

// POST: Allows me to change the name and description of the activity.
// (Description can be useful for summarizing workouts - especially
// if client can prefill based on the type of activity done.)

export const getStrava = (req, res) => res.send('TODO');
export const postStrava = (req, res) => res.send('TODO');
