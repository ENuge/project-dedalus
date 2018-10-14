# project-dedalus

A web dashboard of all my personal stats (exercise, language learning, life).

> I go to encounter for the millionth time the reality of experience and to forge in the smithy of my soul the uncreated conscience of my race.
>
> \- Dedalus

## What It Shall Contain

- Anki learning stats, pulled daily from my computer
- Healthkit or Strava stats, pulled from whichever is easier to get a hold of and access easy
- Perhaps a web UI for easy-inserting my Strava stats, basically a web port of https://github.com/ENuge/strava_uploader .
- Things that are both long-term quantifiable and actually meaningful to future me. These are surprisingly few and far between.

## Why?

This provides a good check that I'm doing what I set out to do. It also provides validation that I am indeed doing things, when I get anxious at a lack of perceived progress. I intend the end result to be my new default new-tab page.

## How To Deploy

1. Clone the project.
2. Be me (be OAuth'ed into this project or create an AppEngine account of your own - in which case run `gcloud init` after downloading the `gcloud` tool).
3. `npm run start` - make sure the project looks good in production mode on localhost (serving the post-babel-etc-transpiled code).
4. (At top-level), `gcloud app deploy`.
5. `gcloud app browse` to see the deployed homepage.

## Running Locally

1. `npm install && npm run dev`. This should start a daemon that will update as you save files (server-built or frontend code).

### Debugging Locally

**NOTE**: This may require Chrome. Not sure. It's based on https://medium.com/@paul_irish/debugging-node-js-nightlies-with-chrome-devtools-7c4a1b95ae27 .
You can stick `debugger;` statements into the source, and then debug via:

1. `npm run debug` (Kicks off a hot-restarting run like `npm run dev`, but with magical debugging capabilities).
2. Open `about:inspect` in Chrome.
3. Click on "Open dedicated DevTools for Node".
4. In your browser, navigate to your normal page address. Watch as your new Chrome inspector window gets caught on your debugger. ⚡✨
