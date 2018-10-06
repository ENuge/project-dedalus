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
3. (At top-level), `gcloud app deploy`.
4. `gcloud app browse` to see the deployed homepage.

## Running Locally
1. `npm install && npm start` (from top-level)
