// @flow
import util from 'util';
import strava from 'strava-v3';
import {Storage} from '@google-cloud/storage';
import {Readable} from 'stream';
import type {$Request, $Response} from 'express';

const storage = new Storage({
  projectId: 'project-id',
  keyFilename: './data/cloud_storage_keyfile.json',
});
const bucket = storage.bucket('project_dedalus_cached');

const readStravaFile = async () => {
  // I was running into "CONTENT_DOWNLOAD_MISMATCH" for some reason.
  // https://github.com/googleapis/google-cloud-node/issues/654 suggests
  // turning off validation which isn't great. But it appears to work well for now. *shrug*
  const remoteStravaFile = bucket.file('strava');
  remoteStravaFile.setMetadata(
    {'Cache-Control': 'private', cacheControl: 'no-cache', metadata: {cacheControl: 'no-cache'}},
    {},
    response => {
      console.log(`response is: ${response}`);
      return null;
    }
  );
  const stream = remoteStravaFile.createReadStream({
    encoding: 'utf-8',
    validation: false,
    cacheControl: 'no-cache',
    metadata: {
      cacheControl: 'no-cache',
    },
  });
  let contents = '';
  stream.on('data', chunk => {
    console.log(`A chunk of our file is: ${JSON.stringify(chunk)}`);
    contents += chunk;
  });
  return new Promise((resolve, reject) => {
    stream.on('end', () => resolve(contents));
    stream.on('error', error => {
      console.log(`Error in reading file from Cloud Storage. Error: ${JSON.stringify(error)}`);
      reject(error);
    });
  });
};

const getCachedStravaV2 = async (): Object => {
  try {
    const contents = await readStravaFile();
    return contents ? JSON.parse(contents) : {};
  } catch (getError) {
    console.warn(`Error reading cached Strava data. Error: ${getError}`);
  }
};

// This was the v1 - purely local - before realizing I can't create or modify
// files in the appengine environment. Keeping around for posterity / if I
// ever move off Google, it's some base point.
// const getCachedStrava = async (): ?Object => {
//   const readFile = util.promisify(fs.readFile);
//   let fileResponse = null;
//   try {
//     fileResponse = await readFile('./cached/strava', 'utf8');
//   } catch (error) {
//     console.log(`Error reading cached Strava data. Error: ${error}`);
//     return null;
//   }

//   return JSON.parse(fileResponse);
// };

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

const cacheActivitiesV2 = async (activities): Promise<void> => {
  console.log('Just before piping anything');
  const remoteStravaFile = bucket.file('strava');
  const stream = new Readable();
  stream.push(JSON.stringify(activities));
  stream.push(null);
  stream.pipe(
    remoteStravaFile.createWriteStream({validation: false, metadata: {cacheControl: 'no-cache'}})
  );
  stream.pipe(process.stdout);
  console.log('Just after piping out our detailed activities');
  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      console.log('just after piping out our detailed activities');
      resolve();
    });
    stream.on('error', () => reject());
  });
};

// This was the v1 - purely local - before realizing I can't create or modify
// files in the appengine environment. Keeping around for posterity / if I
// ever move off Google, it's some base point.
// const cacheActivities = (activities): void => {
//   fs.writeFile('./cached/strava', JSON.stringify(activities), err => {
//     if (err) {
//       console.log(`Error writing to file! ${JSON.stringify(err)}`);
//     }
//   });
// };

export const getStrava = async (req: $Request, res: $Response) => {
  console.log('Start of function!');
  const cachedStrava = await getCachedStravaV2();
  // If no cachedStrava, hit Strava's endpoint, get all activities with all
  // descriptions.
  console.log(`just after reading from cache. cachedStrava: ${JSON.stringify(cachedStrava)}`);
  const listActivitiesPromise = util.promisify(strava.athlete.listActivities);
  const basicActivitiesFromStrava = await listActivitiesPromise({});

  // cachedStrava contains all activities with descriptions, but not necessarily
  // the latest activities - in that case, merge it with the data we just received
  // from Strava.
  const activitiesWithDetails = cachedStrava
    ? mergeActivities([cachedStrava, basicActivitiesFromStrava])
    : await fetchActivitiesWithDetails(basicActivitiesFromStrava);
  if (!cachedStrava) {
    console.warn('WARNING: HAD TO FETCH ALL DETAILS FROM STRAVA');
  }
  cacheActivitiesV2(activitiesWithDetails);
  res.send(activitiesWithDetails);
};
export const postStrava = async (req: $Request, res: $Response) => {
  // Post the updated description to Strava.
  // But first, merge it with our existing cached Strava activities
  // so subsequent gets have that description.
  const postedActivity = req.body;
  // This cache should always be populated by now. But just in case,
  // and to appease the flow gods, we'll check before merging.
  const cachedActivities = await getCachedStravaV2();
  const mergedActivities = cachedActivities
    ? mergeActivities([cachedActivities, [postedActivity]])
    : [postedActivity];
  await cacheActivitiesV2(mergedActivities);

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
