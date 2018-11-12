// @flow
import React, {Component} from 'react';
import axios from 'axios';
import AllActivitiesTable from './AllActivitiesTable';
import StravaDailyActivity from './StravaDailyActivity';

// There are a couple of additional fields that I'm not bothering typing because
// I don't think they'll ever be useful (`resource_state`, for instance).
type Activity = {|
  name: string,
  athlete: {
    id: number,
  },
  distance: number,
  moving_time: number, // moving_time and elapsed_time may always be identical?
  elapsed_time: number,
  total_elevation_gain: number, // (Is this ever non-0, given I've no altimeter)
  type: string, // May always be "Workout"
  id: number, // Used to generate the links to Strava
  start_date: string, // formatted, by default, like "2018-10-28T02:23:12Z"
  start_date_local: string, // takes the time from UTC to PST
  timezone: string, // ex: "(GMT-08:00) America/Los_Angeles"
  start_latlng: ?Object, // TODO: Type this Object. It might just be a string?
  // There's also start_latitude and start_longitude, dunno why??
  end_latlng: ?Object,
  location_city: ?string,
  location_state: ?string,
  location_country: ?string,
  private: boolean,
  average_speed: number,
  max_speed: number,
  has_heartrate: boolean,
  average_heartrate: number,
  max_heartrate: number,
  calories: number,
  description?: ?string, // listActivities does not return this, but getActivity(id) does.
|};
export type Activities = Array<Activity>;
type State = {|activities: Activities|};

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
        this.setState({activities: response.data});
      })
      .catch();
  }

  render() {
    const {activities} = this.state;
    if (activities.length === 0) {
      return null;
    }
    return (
      <React.Fragment>
        <StravaDailyActivity activities={activities} />
        <AllActivitiesTable
          activities={activities}
          // onChange={} TODO: Make these able to edit the name of the activity.
          // onSubmit={}
        />
      </React.Fragment>
    );
  }
}

export default Strava;
