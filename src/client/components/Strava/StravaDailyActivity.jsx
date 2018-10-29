// @flow
import * as React from 'react';
import type {Activities} from './Strava';

const dateExtractorRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}/;
const millisecondsInDay = 1000 * 60 * 60 * 24; // he did the monster math

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

const getUniqueActivityDates = (activities: Activities): Array<string> => {
  const activityDates = activities.map(activity => activity.start_date);
  return Array.from(new Set([...activityDates]));
};

const dateStringRelativeToToday = (daysBack: number = 0): string => {
  const date = new Date(new Date() - millisecondsInDay * daysBack);
  const [dateString] = date.toISOString().match(dateExtractorRegex) || [''];
  return dateString;
};

const dateDiff = (dateString1: string, dateString2: string) => {
  // Returns the difference in days between two date strings, as an
  // absolute number.
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);
  const timeDiff = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(timeDiff / millisecondsInDay);
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
  const endDay = new Date(endDate).getDay();
  const correction = (dayOfWeek: number) => (endDay <= dayOfWeek ? 1 : 0);

  let datesRemaining = true;
  let currDate = new Date(endDate);
  while (datesRemaining) {
    const dayOfWeek = currDate.getDay();
    // Am I regretting using strings everywhere? Not at all...
    const [dateString] = currDate.toISOString().match(dateExtractorRegex) || [''];
    weeksWithDays[dayOfWeek].unshift(dateString);

    // This is so terrible...
    const mondayLength = weeksWithDays[0].length;
    if (
      dateString <= initialDate &&
      mondayLength === weeksWithDays[1].length + correction(1) &&
      mondayLength === weeksWithDays[2].length + correction(2) &&
      mondayLength === weeksWithDays[3].length + correction(3) &&
      mondayLength === weeksWithDays[4].length + correction(4) &&
      mondayLength === weeksWithDays[5].length + correction(5) &&
      mondayLength === weeksWithDays[6].length + correction(6)
    ) {
      datesRemaining = false;
    }
    // Go back one day and do it all again!
    currDate = new Date(currDate - millisecondsInDay);
  }

  return weeksWithDays;
};

type Props = {|activities: Activities|};
type State = {|
  focusedDate: string,
  focusedActivities: Activities,
  initialDate: string,
  endDate: string,
|};

class StravaDailyActivity extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const {activities} = this.props;
    const activityDates = getUniqueActivityDates(activities);
    // Implicit sorting by Unicode code points gets dates in ascending order.
    const datesByRecency = activityDates.sort();
    const initialDate = datesByRecency ? datesByRecency[0] : dateStringRelativeToToday(30);
    // const endDate = datesByRecency ? datesByRecency[0] : dateStringRelativeToToday();
    // NOTE: Think more about this - but I think I always want endDate for now
    // to be today, not relative to the data we have.
    const endDate = dateStringRelativeToToday();
    const focusedActivities = getActivitiesForDate(endDate, activities);
    this.state = {
      focusedDate: endDate,
      focusedActivities,
      initialDate,
      endDate,
    };
    this.handleChangedFocusDate = this.handleChangedFocusDate.bind(this);
  }

  handleChangedFocusDate = (focusedDate: string) => {
    const {activities} = this.props;
    const focusedActivities = getActivitiesForDate(focusedDate, activities);
    this.setState({focusedDate, focusedActivities});
  };

  render() {
    // const {activities} = this.props;
    const {initialDate, endDate} = this.state;
    // const numWeeks = Math.ceil(numDaysInRange / 7);
    // const totalDays = numWeeks * 7; // may be slightly larger than numDaysInRange
    // Each cell in our table corresponds to some day. Given it's a 7xX
    // table for some X number of weeks, construct all those dates
    const weeksWithDays = constructWeeklyDates(initialDate, endDate);
    return (
      <table>
        <tbody>
          {weeksWithDays.map(week => (
            <tr>
              {week.map(day => (
                <td>{day}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default StravaDailyActivity;
