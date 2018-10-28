// @flow
import * as React from 'react';
import type {Activities} from './Strava';

type Props = {|activities: Activities|};
type State = {|focusedDate: string, focusedActivities: Activities|};

const isSameDate = (date1: string, date2: string) => {
  // Assumes both at least start with the string "YYYY-MM-DD"
  const [extractedDate1] = date1.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/) || [''];
  const [extractedDate2] = date2.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/) || [''];
  if (!(extractedDate1 && extractedDate2)) {
    return null;
  }

  return extractedDate1 === extractedDate2;
};

const getActivitiesForDate = (date: string, activities: Activities) =>
  // Assumes `date` is in the same format as Strava's.
  activities.filter(activity => isSameDate(activity.start_date, date));

class StravaDailyActivity extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {focusedDate: '', focusedActivities: []}; // TODO: Make this "today", matching Strava's date format
    this.handleChangedFocusDate = this.handleChangedFocusDate.bind(this);
  }

  handleChangedFocusDate = (focusedDate: string) => {
    const {activities} = this.props;
    const focusedActivities = getActivitiesForDate(focusedDate, activities);
    this.setState({focusedDate, focusedActivities});
  };

  render() {
    const {activities} = this.props;
    const {focusedDate, focusedActivities} = this.state;
    // TODO: Actually design our yolk.
    return (
      <div>
        {focusedDate} - {JSON.stringify(focusedActivities)}
        <p>Full activities: {JSON.stringify(activities)}</p>
      </div>
    );
  }
}

export default StravaDailyActivity;
