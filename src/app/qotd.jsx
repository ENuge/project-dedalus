// @flow
import util from 'util';
import axios from 'axios';
import fs from 'fs';

const processQotdResponse = (response: Object): ?string => {
  // Return just the part of the quote of the day that we actually
  // care about.
  try {
    return response.contents.quotes[0].quote;
  } catch {
    console.log(
      `Unexpected response format for Quote of the day! It looks like: ${JSON.stringify(response)}`
    );
    return null;
  }
};

const fetchQotd = async (): Promise<?string> => {
  // Fetch the quote of the day from the network and return it.
  const response = await axios.get('https://quotes.rest/qod?category=inspire');
  if (response.err) {
    return null;
  }
  return processQotdResponse(response);
};

const readCachedQotd = (file: string): ?string => {
  // Return the cached quote of the day, if it is from
  // today. Otherwise, return null.
  const [firstLine, ...rest] = file.split('\n');
  const restLines = rest.join('');
  // secondLine in the file should be formatted exactly like the expected
  // response from the quote of the day API.
  const processedSecondLine = processQotdResponse(JSON.parse(restLines));
  const readDate = new Date(firstLine);
  const nowDate = new Date(Date.now());
  if (
    readDate.getFullYear() === nowDate.getFullYear() &&
    readDate.getMonth() === nowDate.getMonth() &&
    readDate.getUTCDate() === nowDate.getUTCDate()
  ) {
    return processedSecondLine;
  }

  return null;
};

const getCachedQotd = async (): Promise<?string> => {
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
    res.send({qotd: cachedQotd});
    return null;
  }

  const todaysQotd = await fetchQotd();
  // updateCachedQotd(todaysQotd);
  res.send({qotd: todaysQotd});
  return null;
};

export default handleQotd;
