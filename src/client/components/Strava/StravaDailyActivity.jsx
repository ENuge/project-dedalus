// @flow
import * as React from 'react';
import type {Activities} from './Strava';
import StravaTable from './StravaTable';

const dateExtractorRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}/;
const millisecondsInDay = 1000 * 60 * 60 * 24;

const isSameDate = (date1: string, date2: string) => {
  // Assumes both at least start with the string "YYYY-MM-DD"
  const [extractedDate1] = date1.match(dateExtractorRegex) || [''];
  const [extractedDate2] = date2.match(dateExtractorRegex) || [''];
  if (!(extractedDate1 && extractedDate2)) {
    return null;
  }

  return extractedDate1 === extractedDate2;
};

const getActivitiesForDate = (date: string, activities: Activities): Activities =>
  // Assumes `date` is in the same format as Strava's.
  activities.filter(activity => isSameDate(activity.start_date, date));

/**
 * Returns a string formatted like YYYY-MM-DD with no time info.
 * @param {*} dateString A string formatted like 2018-11-03T00:24:18Z
 */
const extractDateFromString = (dateString: string): string => {
  const [date] = dateString.match(dateExtractorRegex) || [''];
  return date;
};

const constructDateString = (date: Date): string => {
  const year = `${date.getFullYear()}`;
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`;
  const day = date.getDate() < 10 ? `0${date.getDate()}` : `${date.getDate()}`;
  return `${year}-${month}-${day}`;
};

// Returns an array of dates, without duplicates, that have at least one activity.
const getUniqueActivityDates = (activities: Activities): Array<string> => {
  const activityDates = activities.map(activity => extractDateFromString(activity.start_date));
  return Array.from(new Set([...activityDates]));
};

const dateStringRelativeToToday = (daysBack: number = 0): string => {
  const date = new Date(new Date() - millisecondsInDay * daysBack);
  return constructDateString(date);
};

/**
 * Scores a given day. Right now it simply sums the total number of heartbeats.
 * @param {*} activities
 */
const scoreDayOfActivities = (activities: Activities) => {
  return activities.reduce(
    (score, activity) => score + activity.average_heartrate * activity.elapsed_time,
    0
  );
};

/**
 * Ranks daily activities as a decimal relative to the "greatest" day (which is 1, 0 activity is 0).
 * @param {*} days A day string, like '2018-10-24'
 * @param {*} activities Activities
 */
const rankDailyActivities = (days: Array<string>, activities: Activities): {[string]: number} => {
  const absoluteScoreDailyActivities = days.reduce((absoluteScoreDailyRankingAccum, day) => {
    // eslint-disable-next-line no-param-reassign
    absoluteScoreDailyRankingAccum[day] = scoreDayOfActivities(
      getActivitiesForDate(day, activities)
    );
    return absoluteScoreDailyRankingAccum;
  }, {});
  const absoluteScores = ((Object.values(absoluteScoreDailyActivities): any): Array<number>);
  const maxScore = Math.max(...absoluteScores);
  return days.reduce((dailyRankingAccum, day) => {
    dailyRankingAccum[day] = absoluteScoreDailyActivities[day] / maxScore; // eslint-disable-line no-param-reassign
    return dailyRankingAccum;
  }, {});
};

const constructWeeklyDates = (initialDate: string, endDate: string): Array<Array<string>> => {
  // Given an initialDate and an endDate, construct and return an array
  // of arrays, where the zeroth inner array is Monday and the sixth inner
  // array is Sunday. (This should really be a class with a better
  // interface than that, but yolo.)
  // If initialDate and endDate are not exactly 7*n days apart, the
  // arrays will include enough dates prior to initialDate to make
  // each week have the same number of days.
  const weeksWithDays = [[], [], [], [], [], [], []];
  // We want the most recent date to appear in a final, not-fully-populated
  // column, unless the most recent date is a Sunday. (So the dates look
  // monotonically increasing, and you don't have a Monday in one column that falls
  // before the Wednesday in the given week.)
  // We do this by comparing each day against a correction, which allows some days
  // of the week to have an extra date.
  const endDay = new Date(endDate).getDay();
  const correction = (dayOfWeek: number) => (endDay >= dayOfWeek ? 1 : 0);

  let datesRemaining = true;
  let currDate = new Date(endDate);
  while (datesRemaining) {
    const dayOfWeek = currDate.getDay();
    const dateString = constructDateString(currDate);
    weeksWithDays[dayOfWeek].unshift(dateString);

    const mondayLength = weeksWithDays[0].length - correction(0);
    if (
      dateString <= initialDate &&
      mondayLength === weeksWithDays[1].length - correction(1) &&
      mondayLength === weeksWithDays[2].length - correction(2) &&
      mondayLength === weeksWithDays[3].length - correction(3) &&
      mondayLength === weeksWithDays[4].length - correction(4) &&
      mondayLength === weeksWithDays[5].length - correction(5) &&
      mondayLength === weeksWithDays[6].length - correction(6)
    ) {
      datesRemaining = false;
    }
    // Go back one day and do it all again!
    currDate = new Date(currDate - millisecondsInDay);
  }

  return weeksWithDays;
};

// Returns the date of the first activity or 30 days ago if no activities
const getInitialDate = (activities: Activities) => {
  const activityDates = getUniqueActivityDates(activities);
  // Implicit sorting by Unicode code points gets dates in ascending order.
  const datesByRecency = activityDates.sort();
  return datesByRecency ? datesByRecency[0] : dateStringRelativeToToday(30);
};

type Props = {|activities: Activities, onChange: Function, onSubmit: Function|};
type State = {|
  focusedDate: string,
  initialDate: string,
  endDate: string,
|};

class StravaDailyActivity extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const {activities} = this.props;
    // Implicit sorting by Unicode code points gets dates in ascending order.
    const initialDate = getInitialDate(activities);
    const endDate = dateStringRelativeToToday();
    this.state = {
      focusedDate: endDate,
      initialDate,
      endDate,
    };
  }

  handleChangedFocusDate = (focusedDate: string) => {
    this.setState({focusedDate});
  };

  render() {
    const {initialDate, endDate, focusedDate} = this.state;
    const {activities, onChange, onSubmit} = this.props;
    const focusedActivities = getActivitiesForDate(focusedDate, activities);
    // Each cell in our table corresponds to some day. Given it's a 7xX
    // table for some X number of weeks, construct all those dates
    const weeksWithDays = constructWeeklyDates(initialDate, endDate);
    const days = weeksWithDays.reduce((accum, week) => [...accum, ...week], []);
    const dayRankings = rankDailyActivities(days, activities);
    // use that to display activities to the right for that date.
    // (Can just be as like a table or something to start.)
    return (
      <React.Fragment>
        <div className="highlighted-date">
          <div className="highlighted-date-selector">
            <div className="highlighted-date-legend">
              <div className="date-legend-monday">Mon</div>
              <div className="date-legend-wednesday">Wed</div>
              <div className="date-legend-friday">Fri</div>
            </div>
            <table className="daily-calendar-table">
              <tbody>
                {weeksWithDays.map(week => (
                  <tr>
                    {week.map(day => (
                      <td>
                        <div
                          className="daily-activity-cell"
                          onClick={() => this.handleChangedFocusDate(day)}
                          role="link"
                          tabIndex="0"
                          onKeyPress={event =>
                            event.keyCode === 13 ? this.handleChangedFocusDate(day) : null
                          }
                          // (34, 139, 34) is forest green. I should probably pretty this up though
                          style={{backgroundColor: `rgb(34, 139, 34, ${dayRankings[day]})`}}
                        >
                          <div className="daily-activity-tooltip">
                            {/* TODO: Make this pretty. */}
                            {day.slice(5)}: {getActivitiesForDate(day, activities).length}{' '}
                            activities
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="highlighted-activities">
            <h3>Activities on: {focusedDate}</h3>
            <StravaTable activities={focusedActivities} onChange={onChange} onSubmit={onSubmit} />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default StravaDailyActivity;
