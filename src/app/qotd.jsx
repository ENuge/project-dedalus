// @flow
import util from 'util';
import axios from 'axios';
import fs from 'fs';

const processQotdResponse = (response: Object): ?string => {
  try {
    return response.contents.quotes[0].quote;
  } catch {
    console.log(
      `Unexpected response format for Quote of the day! It looks like: ${JSON.stringify(response)}`
    );
    return null;
  }
};

const readTodaysQotd = (file: string): ?string => {
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

const fetchQotd = (): Promise => {
  // Fetches the Quote of the Day from the QOTD of the API.
  const requestPromise = axios
    .get('https://quotes.rest/qod?category=inspire')
    .then(
      response =>
        // TODO: See how this is actually formatted...
        response.data.contents.quotes[0].quote
    )
    .catch(error => {
      console.log(`Error fetching quote of the day: ${error}`);
      return null;
    });
  return requestPromise;
};

const handleQotd = (req, res) => {
  let qotdRead = null;
  const readFile = util.promisify(fs.readFile);
  readFile('./cached/qotd', 'utf8')
    .then(file => {
      qotdRead = readTodaysQotd(file);
      return null;
    })
    .catch(error => console.log(error))
    .finally(() => {
      if (!qotdRead) {
        // Make axios call for qotd.
        const qotdPromise = fetchQotd();
        qotdPromise.then(result => res.send({qotd: result}));
      } else {
        res.send({qotd: qotdRead});
      }
    });
};

export default handleQotd;
