// @flow
import React, {Component} from 'react';
import axios from 'axios';
import dateFormat from 'dateformat';

type State = {activities: Array<?Object>};

const formatDatetime = (datetime: string) => dateFormat(datetime, 'UTC:ddd mm/d HH:MM');

class Strava extends Component<{}, State> {
  constructor() {
    super();
    this.state = {activities: []};
  }

  componentDidMount() {
    axios
      .get('/ajax/strava')
      .then(response => {
        console.log(`Ajax list activities response: ${JSON.stringify(response.data[0])}`);
        // TODO: Some fields like `description` are only accessible on the get/activity/{id}
        // endpoint. So, go back and call that once per activity to actually hydrate the activities...smh.
        this.setState({activities: response.data});
      })
      .catch();
  }

  handleDescriptionSubmit(currentActivity, event) {
    event.preventDefault();
    const {activities} = this.state;
    const updatedActivity = activities.find(
      activity => activity && activity.id === currentActivity.id
    );
    axios.post('/ajax/strava', updatedActivity);
  }

  handleDescriptionChange(currentActivity, event) {
    // TODO: Pass with event the actual activity that caused
    // this, use that to update state properly.
    const {activities} = this.state;
    const newActivities = activities.reduce((accum, activity) => {
      if (activity.id === currentActivity.id) {
        return [...accum, {...activity, description: event.target.value}];
      }
      return [...accum, activity];
    }, []);
    this.setState({activities: newActivities});
  }

  render() {
    const {activities} = this.state;
    if (activities.length === 0) {
      return null;
    }
    console.log(`activities is: ${JSON.stringify(activities)}`);
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
            <tr>
              <td>
                <a href={`https://strava.com/activities/${activity.id}`}>{activity.type}</a>
              </td>
              <td>{formatDatetime(activity.start_date_local)}</td>
              <td>{Math.round(activity.elapsed_time / 60)}</td>
              <td>{activity.average_heartrate}</td>
              <td>{activity.max_heartrate}</td>
              <td>{activity.description}</td>
              <td>
                <form onSubmit={this.handleDescriptionSubmit.bind(this, activity)}>
                  <label>
                    Edit:{' '}
                    <input
                      type="text"
                      value={activity.description}
                      onChange={this.handleDescriptionChange.bind(this, activity)}
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
  }
}

export default Strava;
