// @flow
import util from 'util';
import strava from 'strava-v3';
import fs from 'fs';
import type {$Request, $Response} from 'express';

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

const mergeActivities = (listsOfActivities: Array<Array<Object>>): Array<Object> => {
  // Merges two _lists_ of activities, keeping the most descriptive copy of each
  // activity.
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

const cacheActivities = (activities): void => {
  fs.writeFile('./cached/strava', JSON.stringify(activities), err => {
    if (err) {
      console.log(`Error writing to file! ${JSON.stringify(err)}`);
    }
  });
};

export const getStrava = async (req: $Request, res: $Response) => {
  const cachedStrava = await getCachedStrava();
  // If no cachedStrava, hit Strava's endpoint, get all activities with all
  // descriptions.
  const listActivitiesPromise = util.promisify(strava.athlete.listActivities);
  const basicActivitiesFromStrava = await listActivitiesPromise({});

  // cachedStrava contains all activities with descriptions, but not necessarily
  // the latest activities - in that case, merge it with the data we just received
  // from Strava.
  const activitiesWithDetails = cachedStrava
    ? mergeActivities([cachedStrava, basicActivitiesFromStrava])
    : await fetchActivitiesWithDetails(basicActivitiesFromStrava);

  cacheActivities(activitiesWithDetails);
  res.send(activitiesWithDetails);
};
export const postStrava = async (req: $Request, res: $Response) => {
  // Post the updated description to Strava.
  // But first, merge it with our existing cached Strava activities
  // so subsequent gets have that description.
  const postedActivity = req.body;
  // This cache should always be populated by now. But just in case,
  // and to appease the flow gods, we'll check before merging.
  const cachedActivities = await getCachedStrava();
  const mergedActivities = cachedActivities
    ? mergeActivities([cachedActivities, [postedActivity]])
    : [postedActivity];
  cacheActivities(mergedActivities);

  strava.activities.update(
    {id: postedActivity.id, description: postedActivity.description},
    (err, payload) => {
      if (err) {
        console.log(`Error updating description in Strava: ${JSON.stringify(err)}`);
        res.send({success: false});
      } else {
        console.log(`Updated Strava activity to: ${JSON.stringify(payload)}`);
        res.send({success: true});
      }
    }
  );
};
