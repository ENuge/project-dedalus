// @flow
import * as React from 'react';
import axios from 'axios';
import type {Activities} from './Strava';
import DailyActivityTable from './DailyActivityTable';

const dateExtractorRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}/;

const isSameDate = (date1: string, date2: string) => {
  // Assumes both at least start with the string "YYYY-MM-DD"
  const [extractedDate1] = date1.match(dateExtractorRegex) || [''];
  const [extractedDate2] = date2.match(dateExtractorRegex) || [''];
  if (!(extractedDate1 && extractedDate2)) {
    return null;
  }

  return extractedDate1 === extractedDate2;
};

/**
 * Gets the full, detailed, activities for the given date.
 * @param {} date
 * @param {*} activities
 */
const getDetailedActivitiesForDate = (
  date: string,
  activities: Activities
): Promise<Activities> => {
  // Assumes `date` is in the same format as Strava's.
  const activitiesOnDate = activities.filter(activity => isSameDate(activity.start_date, date));
  const activityIDs = activitiesOnDate.map(activity => activity.id);
  return axios
    .get('/ajax/strava_details', {params: {ids: activityIDs}})
    .then(response => response.data);
};

const getBasicActivitiesForDate = (date: string, activities: Activities) =>
  activities.filter(activity => isSameDate(date, activity.start_date));

/**
 * Returns a string formatted like YYYY-MM-DD with no time info.
 * @param {*} dateString A string formatted like 2018-11-03T00:24:18Z
 */
const extractDateFromString = (dateString: string): string => {
  const [date] = dateString.match(dateExtractorRegex) || [''];
  return date;
};

const constructDateFromString = (dateString: string) => {
  const [year, month, day] = dateString.split('-') || ['', '', ''];
  // month is 0-indexed for some reason...
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
};

/**
 * Returns a date for the given string. This gives the appropriate date where
 * `new Date('YYYY-MM-DD')` returns DD-1 because it treats the string date as UTC
 * midnight but then returns it in local time, minus 8 hours for PST.
 * @param date A date of the form '2018-11-11' . This does not expect, and may fail,
 * if any additional time info is included in the string.
 */
const constructStringFromDate = (date: Date): string => {
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
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return constructStringFromDate(date);
};

/**
 * Scores a given day. Right now it simply sums the total number of heartbeats.
 * @param {*} activities
 */
const scoreDayOfActivities = (activities: Activities) =>
  activities.reduce((score, activity) => {
    if (activity.average_heartrate && activity.elapsed_time) {
      return score + activity.average_heartrate * activity.elapsed_time;
    }
    return 0;
  }, 0);

/**
 * Ranks daily activities as a decimal relative to the "greatest" day (which is 1, 0 activity is 0).
 * @param {*} days A day string, like '2018-10-24'
 * @param {*} activities Activities
 */
const rankDailyActivities = (days: Array<string>, activities: Activities): {[string]: number} => {
  const absoluteScoreDailyActivities = days.reduce((absoluteScoreDailyRankingAccum, day) => {
    // eslint-disable-next-line no-param-reassign
    absoluteScoreDailyRankingAccum[day] = scoreDayOfActivities(
      getBasicActivitiesForDate(day, activities)
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

/**
 *  Given an initialDate and an endDate, construct and return an array
 *  of arrays, where the zeroth inner array is Monday and the sixth inner
 *  array is Sunday, matching each date in order to its weekday.
 */
const constructWeeklyDates = (initialDate: string, endDate: string): Array<Array<string>> => {
  const weeksWithDays = [[], [], [], [], [], [], []];
  // We want the most recent date to appear in a final, not-fully-populated
  // column, unless the most recent date is a Sunday. (So the dates look
  // monotonically increasing, and you don't have a Monday in one column that falls
  // before the Wednesday in the given week.)
  // We do this by comparing each day against a correction, which allows some days
  // of the week to have an extra date.
  const currDate = constructDateFromString(endDate);
  // This const looks silly but is important - otherwise we're closing on currDate,
  // which changes each iteration.
  const currDateDay = currDate.getDay();
  const correction = (dayOfWeek: number) => (currDateDay >= dayOfWeek ? 1 : 0);

  let datesRemaining = true;
  while (datesRemaining) {
    const dayOfWeek = currDate.getDay();
    const dateString = constructStringFromDate(currDate);
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
    currDate.setDate(currDate.getDate() - 1);
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

type MonthHeadersProps = {|days: Array<string>|};
const MonthHeaders = (props: MonthHeadersProps) => {
  const {days} = props;
  const monthNumToMonth = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return (
    <tr>
      {days.map(day => {
        // date is like '2018-11-04', which the date constructor treats
        // as the UTC time (and thus local time may be the day before)
        // so we always use UTC.
        const date = new Date(day);
        // "If it's a first Monday of the month"
        if (date.getUTCDay() === 0 && date.getUTCDate() <= 7) {
          return (
            <td key={day}>
              <div className="date-legend-month">{monthNumToMonth[date.getUTCMonth()]}</div>
            </td>
          );
        }
        // Return an empty cell to take up one column's worth of space
        if (date.getUTCDay() === 0) {
          return (
            <td key={day}>
              <div className="date-legend-month" />
            </td>
          );
        }
        return null;
      })}
    </tr>
  );
};

type Props = {|activities: Activities|};
type State = {|
  focusedDate: string,
  initialDate: string,
  endDate: string,
  detailedActivitiesForFocusedDate: Activities,
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
      detailedActivitiesForFocusedDate: [],
    };
    // TODO: Fix this - this is a super hacky way of getting around
    // the fact that neither the constructor nor the render
    // can be async functions.
    this.handleChangedFocusDate(endDate, activities);
  }

  handleChangedFocusDate(focusedDate: string, activities: Activities) {
    getDetailedActivitiesForDate(focusedDate, activities).then(detailedActivitiesForFocusedDate =>
      this.setState({focusedDate, detailedActivitiesForFocusedDate})
    );
  }

  render() {
    const {initialDate, endDate, focusedDate, detailedActivitiesForFocusedDate} = this.state;
    const {activities} = this.props;
    // Each cell in our table corresponds to some day. Given it's a 7xX
    // table for some X number of weeks, construct all those dates
    const weeksWithDays = constructWeeklyDates(initialDate, endDate);
    const days = weeksWithDays.reduce((accum, week) => [...accum, ...week], []);
    const dayRankings = rankDailyActivities(days, activities);

    // use that to display activities to the right for that date.
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
                <MonthHeaders days={days} />
                {weeksWithDays.map(week => (
                  <tr key={JSON.stringify(week)}>
                    {week.map(day => (
                      <td key={day}>
                        <div className="daily-activity-cell-area">
                          <div
                            className="daily-activity-cell"
                            onClick={() => this.handleChangedFocusDate(day, activities)}
                            role="link"
                            tabIndex="0"
                            onKeyPress={event =>
                              event.keyCode === 13
                                ? this.handleChangedFocusDate(day, activities)
                                : null
                            }
                            // (34, 139, 34) is forest green. I should probably pretty this up though
                            style={{backgroundColor: `rgb(34, 139, 34, ${dayRankings[day]})`}}
                          >
                            <div className="daily-activity-tooltip">
                              {day.slice(5)}
                              <br />
                              {getBasicActivitiesForDate(day, activities).length} activities
                            </div>
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DailyActivityTable
            activities={
              detailedActivitiesForFocusedDate.length > 0
                ? detailedActivitiesForFocusedDate
                : getBasicActivitiesForDate(focusedDate, activities)
            }
            dateString={focusedDate}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default StravaDailyActivity;
