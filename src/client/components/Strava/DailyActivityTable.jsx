// @flow
import * as React from 'react';
import dateFormat from 'dateformat';
import type {Activities} from './Strava';

const formatDatetime = (datetime: string): string => dateFormat(datetime, 'UTC:ddd mm/d HH:MM');
type Props = {|
  activities: Activities,
  onChange: Function,
  onSubmit: Function,
|};

const DailyActivityTable = (props: Props) => {
  const {activities, onChange, onSubmit} = props;
  return (
    <table>
      <thead>
        <tr>
          <th>Activity</th>
          <th>Datetime</th>
          <th>Duration (mins)</th>
          <th>Avg Heartrate</th>
          <th>Max Heartrate</th>
          <th>Description</th>
          <th>Total elapsed workout time (today)</th>
        </tr>
      </thead>
      <tbody>
        {activities.map(activity => (
          <tr key={activity.id}>
            <td>
              <a href={`https://strava.com/activities/${activity.id}`}>{activity.type}</a>
            </td>
            <td>{formatDatetime(activity.start_date_local)}</td>
            <td>{Math.round(activity.elapsed_time / 60)}</td>
            <td>{activity.average_heartrate}</td>
            <td>{activity.max_heartrate}</td>
            <td>{activity.description}</td>
            <td>
              <form onSubmit={onSubmit.bind(null, activity)}>
                <label htmlFor={`${activity.id}-activity-description`}>
                  Edit:{' '}
                  <input
                    id={`${activity.id}-activity-description`}
                    type="text"
                    value={activity.description || ''}
                    onChange={event => onChange(activity, event)}
                  />
                </label>
                <input type="submit" value="Submit" />
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DailyActivityTable;
