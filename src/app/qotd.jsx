// @flow
import util from 'util';
import axios from 'axios';
import fs from 'fs';

const fetchQotd = async (): Promise<?Object> => {
  // Fetch the quote of the day from the network and return it.
  let response = null;
  try {
    response = await axios('https://quotes.rest/qod?category=inspire');
  } catch (error) {
    console.log(`Response failed with error: ${error}`);
    return null;
  }
  return response.data;
};

const updateCachedQotd = async (qotdString: string): void => {
  fs.writeFile('./cached/qotd', qotdString, err => {
    console.log(`Error writing to file! ${JSON.stringify(err)}`);
  });
};

const readCachedQotd = (file: string): ?Object => {
  // Return the cached quote of the day, if it is from
  // today. Otherwise, return null.
  const cachedResponse = JSON.parse(file);
  if (
    !cachedResponse ||
    !cachedResponse.contents ||
    !cachedResponse.contents.quotes ||
    cachedResponse.contents.quotes.length === 0 ||
    !cachedResponse.contents.quotes[0].date ||
    !cachedResponse.contents.quotes[0].quote
  ) {
    console.log(
      `Stored data in unexpected format! Failing early. data is: ${JSON.stringify(cachedResponse)}`
    );
    return null;
  }

  const cachedDate = new Date(cachedResponse.contents.quotes[0].date);
  const nowDate = new Date(Date.now());
  if (
    cachedDate.getFullYear() === nowDate.getFullYear() &&
    cachedDate.getMonth() === nowDate.getMonth() &&
    cachedDate.getUTCDate() === nowDate.getUTCDate()
  ) {
    return cachedResponse;
  }

  return null;
};

const getCachedQotd = async (): Promise<?Object> => {
  // Get the quote of the day we have printed out to file.
  const readFile = util.promisify(fs.readFile);
  let fileResponse = null;
  try {
    fileResponse = await readFile('./cached/qotd', 'utf8');
  } catch (error) {
    console.log(`Error reading cached quote of the day. Error: ${error}`);
    return null;
  }

  return readCachedQotd(fileResponse);
};

const handleQotd = async (req: Object, res: Object): Promise<null> => {
  // Try to read the quote of the day first from file. I do this
  // for "performance" (not that I actually care), but also for
  // debugging. This is intended purely for personal use - it's not
  // a way of circumventing the API rate limiting for public use.
  const cachedQotd = await getCachedQotd();

  if (cachedQotd) {
    res.send(cachedQotd);
    return null;
  }

  const todaysQotd = await fetchQotd();
  if (todaysQotd) {
    await updateCachedQotd(JSON.stringify(todaysQotd));
  }
  res.send(todaysQotd);
  return null;
};

export default handleQotd;
