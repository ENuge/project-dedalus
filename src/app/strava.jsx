// @flow
import util from 'util';
import strava from 'strava-v3';
import fs from 'fs';
import type {$Request, $Response} from 'express';

// Get data from strava using my API key (read from a local file
// that is not committed to git). Post that, for now, in just a
// raw format. Eventually I want it to be formatted with the ability
// to easily add comments to workouts but we'll work our way to that!

// POST: Allows me to change the name and description of the activity.
// (Description can be useful for summarizing workouts - especially
// if client can prefill based on the type of activity done.)

const getCachedStrava = async (): ?Object => {
  const readFile = util.promisify(fs.readFile);
  let fileResponse = null;
  try {
    fileResponse = await readFile('./cached/strava', 'utf8');
  } catch (error) {
    console.log(`Error reading cached Strava data. Error: ${error}`);
    return null;
  }

  return JSON.parse(fileResponse);
};

const fetchActivitiesWithDetails = async (basicActivities: Object) => {
  // Fetches from the Strava API all the activities, with all their details.
  // Which requires first fetching all the data, then fetching the details
  // for each of those activities.
  const getActivityPromise = util.promisify(strava.activities.get);
  return Promise.all(
    basicActivities.map(({id: activityID}) => getActivityPromise({id: activityID}))
  );
};

// listOfActivities.reduce((activitiesAccum, activity) => {
//   [...activitiesAccum, activity];
// }, []);
const mergeActivities = listsOfActivities => {
  const activities = listsOfActivities.reduce(
    (listActivitiesAccum, listOfActivities) => [...listActivitiesAccum, ...listOfActivities],
    []
  );
  return activities.reduce((uniqActivityAccum, activity) => {
    // Resolve duplicates by only keeping the one with a description field.
    const indexOfDup = uniqActivityAccum.findIndex(
      ({id: potentialDupID}) => potentialDupID === activity.id
    );
    if (indexOfDup !== -1) {
      // splice removes the element at the given index
      const [dupActivity] = uniqActivityAccum.splice(indexOfDup, 1);
      const activityToKeep = activity.description ? activity : dupActivity;
      return [...uniqActivityAccum, activityToKeep];
    }
    return [...uniqActivityAccum, activity];
  }, []);
};

export const getStrava = async (req: $Request, res: $Response) => {
  const cachedStrava = await getCachedStrava();
  // If no cachedStrava, hit Strava's endpoint, get all activities with all
  // descriptions.
  const listActivitiesPromise = util.promisify(strava.athlete.listActivities);
  const basicActivitiesFromStrava = await listActivitiesPromise({});
  const activitiesWithDetails =
    cachedStrava || (await fetchActivitiesWithDetails(basicActivitiesFromStrava));

  // cachedStrava contains all activities with descriptions, but not necessarily
  // the latest activities - in that case, meerge it with the data we just received
  // from Strava.
  const mergedActivities = cachedStrava
    ? mergeActivities([cachedStrava, basicActivitiesFromStrava])
    : activitiesWithDetails;

  // write mergedActivities to cache
  // return mergedActivities
  res.send(mergedActivities);

  // strava.athlete.listActivities({}, (err, payload) => {
  //   if (!err) {
  //     res.send(payload);
  //   } else {
  //     console.log(`Error receiving response from strava: ${err}`);
  //   }
  // });
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

// Add two things:
// First, make getStrava read a cached copy. Get that, then add the latest from the Strava API hit. Update the cached copy and return the superset.
// postStrava should update the cached copy with the POSTed data, then also post it to Strava.
