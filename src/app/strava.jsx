// @flow
import util from 'util';
import strava from 'strava-v3';
import type {$Request, $Response} from 'express';

const fetchActivitiesWithDetails = async (basicActivities: Object) => {
  // Fetches from the Strava API all the activities, with all their details.
  // Which requires first fetching all the data, then fetching the details
  // for each of those activities.
  const getActivityPromise = util.promisify(strava.activities.get);
  return Promise.all(
    basicActivities.map(({id: activityID}) => getActivityPromise({id: activityID}))
  );
};

export const getStrava = async (req: $Request, res: $Response) => {
  const listActivitiesPromise = util.promisify(strava.athlete.listActivities);
  const basicActivitiesFromStrava = await listActivitiesPromise({per_page: 50});

  // TODO: Uncomment this and actually get all the data!!
  // const activitiesWithDetails = await fetchActivitiesWithDetails(basicActivitiesFromStrava);
  res.send(basicActivitiesFromStrava);
};
export const postStrava = async (req: $Request, res: $Response) => {
  const postedActivity = req.body;

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
