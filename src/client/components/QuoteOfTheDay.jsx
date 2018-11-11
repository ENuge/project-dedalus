// @flow
import React, {Component} from 'react';
import axios from 'axios';

type State = {
  quoteObject: {quote: ?string, author: ?string},
};

class QuoteOfTheDay extends Component<{}, State> {
  constructor() {
    super();
    this.state = {
      quoteObject: {quote: null, author: null},
    };
  }

  componentDidMount() {
    axios
      .get('/ajax/qotd')
      .then(response => {
        this.setState({quoteObject: response.data.contents.quotes[0]});
      })
      .catch(error => {
        console.log(`Error fetching quote of the day: ${error}`);
      });
  }

  render() {
    const {
      quoteObject: {quote, author},
    } = this.state;
    if (!quote) {
      return null;
    }

    return (
      <div className="QuoteOfTheDay">
        <em>{quote}</em>
        <p>- {author}</p>
      </div>
    );
  }
}

export default QuoteOfTheDay;
