// @flow
import util from 'util';
import axios from 'axios';
import fs from 'fs';

const fetchQotd = async (): Promise<?Object> => {
  // Fetch the quote of the day from the network and return it.
  const response = await axios.get('https://quotes.rest/qod?category=inspire');
  if (response.err) {
    return null;
  }
  return response;
};

const readCachedQotd = (file: string): ?Object => {
  // Return the cached quote of the day, if it is from
  // today. Otherwise, return null.
  const cachedResponse = JSON.parse(file);
  if (
    !cachedResponse ||
    !cachedResponse.contents.quotes[0].date ||
    !cachedResponse.contents.quotes[0].quote
  ) {
    console.log('Stored data in unexpected format! Failing early.');
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
  const fileResponse = await readFile('./cached/qotd', 'utf8');
  if (fileResponse.err) {
    console.log(`Error reading cached quote of the day: ${fileResponse.err}`);
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
  // updateCachedQotd(todaysQotd);
  res.send(todaysQotd);
  return null;
};

export default handleQotd;
