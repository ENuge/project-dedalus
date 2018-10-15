// @flow
import React, {Component} from 'react';
import axios from 'axios';

type State = {activities: ?Object};

class Strava extends Component<{}, State> {
  constructor() {
    super();
    this.state = {activities: null};
  }

  componentDidMount() {
    axios
      .get('/ajax/strava')
      .then(response => {
        // TODO: Filter response then update state.
        console.log(response);
        this.setState({activities: response.data});
      })
      .catch();
  }

  render() {
    const {activities} = this.state;
    if (!activities) {
      return null;
    }
    console.log(`activities is: ${JSON.stringify(activities)}`);
    return (
      <table>
        <thead>
          <tr>
            <th>Activity</th>
            <th>Datetime</th>
            <th>Duration</th>
            <th>Avg Heartrate</th>
            <th>Max Heartrate</th>
            <th>Strava Link</th>
            <th>Description</th>
            <th>Total elapsed workout time (today)</th>
          </tr>
        </thead>
        <tbody>
          {activities.map(activity => (
            <tr>
              <td>{activity.type}</td>
              <td>{activity.start_date_local}</td>
              <td>{activity.elapsed_time / 60} mins</td>
              <td>{activity.average_heartrate}</td>
              <td>{activity.max_heartrate}</td>
              <td>{`https://strava.com/activities/${activity.id}`}</td>
              <td>{activity.description}</td>
              <td>TODO</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
}

export default Strava;
