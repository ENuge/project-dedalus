// @flow
import * as React from 'react';
import axios from 'axios';
import dateFormat from 'dateformat';
import type {Activities, Activity} from './Strava';

const formatDatetime = (datetime: string): string => dateFormat(datetime, 'UTC:ddd mm/d HH:MM');
type State = {|activities: Activities, editingActivity: ?Activity|};
type Props = {|
  activities: Activities,
  dateString: string,
|};

class DailyActivityTable extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const {activities} = this.props;
    this.state = {activities, editingActivity: null};
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    // TODO: I don't like this mix of derived _and updated_ state
    // from props I have here...
    const {activities} = props;
    const {activities: activitiesInState, editingActivity} = state;
    // If new activities were passed as props, reset state to be like constructor.
    const propsIds = activities.map(activity => activity.id);
    const stateIdsSet = new Set(activitiesInState.map(activity => activity.id));
    if (!propsIds.every(propId => stateIdsSet.has(propId)))
      return {activities, editingActivity: null};
    // if (!editingActivity) return {activities};
    // const newEditingActivity = activities.some(activity => activity.id === editingActivity.id)
    //   ? editingActivity
    //   : null;
    return {activitiesInState, editingActivity};
  }

  onEdit = (activity: Activity, event: SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState({editingActivity: activity});
  };

  onClose = (event: SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    this.setState({editingActivity: null});
  };

  handleDescriptionChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
    // Note that only a submit POSTs the data back to Strava - make that clear in the UX.
    // (Right now it's not at all obvious!)
    event.preventDefault(); // Just to be safe
    const {activities, editingActivity} = this.state;
    if (!editingActivity) return;
    const newEditingActivity = {...editingActivity, description: event.target.value};
    const newActivities = activities.reduce((accum, activity) => {
      if (activity.id === editingActivity.id) {
        return [...accum, {...activity, description: event.target.value}];
      }
      return [...accum, activity];
    }, []);
    this.setState({activities: newActivities, editingActivity: newEditingActivity});
  };

  handleDescriptionSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const {editingActivity} = this.state;
    axios.post('/ajax/strava', editingActivity);
    this.setState({editingActivity: null});
  };

  render() {
    const {dateString} = this.props;
    const {activities, editingActivity} = this.state;

    if (editingActivity) {
      return (
        <div className="highlighted-activities">
          <button type="button" onClick={this.onClose}>
            Close
          </button>
          <h3>
            {editingActivity.type} on: {dateString}
          </h3>
          <form onSubmit={this.handleDescriptionSubmit}>
            <label htmlFor={`${editingActivity.id}-activity-description`}>
              Edit:{' '}
              <input
                id={`${editingActivity.id}-activity-description`}
                className="DailyActivityTable-input"
                type="text"
                value={editingActivity.description || ''}
                onChange={this.handleDescriptionChange}
                placeholder="Describe the workout! Was it good, bad, ugly? Are you slipping? Or are you killing it?"
              />
            </label>
            <input type="submit" value="Submit" />
          </form>
        </div>
      );
    }
    return (
      <div className="highlighted-activities">
        <h3>Activities on: {dateString}</h3>
        <table>
          <thead>
            <tr>
              <th>Activity</th>
              <th>Datetime</th>
              <th>Duration (mins)</th>
              <th>Avg Heartrate</th>
              <th>Max Heartrate</th>
              <th>Description</th>
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
                  <button type="button" onClick={event => this.onEdit(activity, event)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default DailyActivityTable;
