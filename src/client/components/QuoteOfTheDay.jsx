// @flow
import React, {Component} from 'react';
import axios from 'axios';

type State = {
  qotd: ?Object, // TODO: type better?
};

class QuoteOfTheDay extends Component<{}, State> {
  state = {
    qotd: null,
  };

  componentDidMount() {
    axios
      .get('/ajax/qotd')
      .then(response => {
        // TODO: See how this is actually formatted...
        this.setState({qotd: response});
      })
      .catch(error => {
        console.log(`Error fetching quote of the day: ${error}`);
      });
  }

  formatQotd() {
    const {qotd} = this.state;
    if (!qotd) {
      return null;
    }
    return qotd;
  }

  render() {
    const qotdFormatted = this.formatQotd();

    return qotdFormatted;
  }
}

export default QuoteOfTheDay;
