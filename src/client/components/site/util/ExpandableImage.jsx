// @flow
import React from 'react';

type Props = {|
  // height?: string,
  alt: string,
  src: string,
  rotate90: Boolean,
  // TODO: Should also pass down any extras to <img...> but I forget
  // the syntax for that exactly.
|};

type State = {|
  isExpanded: Boolean,
|};

class ExpandableImage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isExpanded: false,
    };
  }

  toggleExpandImage = () => {
    const {isExpanded} = this.state;
    this.setState({isExpanded: !isExpanded});
  };

  render() {
    const {alt, src, rotate90} = this.props;
    const {isExpanded} = this.state;

    if (!isExpanded) {
      return (
        <img
          src={src}
          width="500px"
          height={rotate90 ? '500px' : ''}
          alt={alt}
          onClick={this.toggleExpandImage}
          className={rotate90 ? 'rotate90' : ''}
        />
      );
    }
    const expandedWidth = window.innerWidth - 100;
    const maxHeight = window.innerHeight - 100;
    // TODO: This image may still scroll if it is taller than it is wide.
    return (
      <div className="ExpandableImage-expanded" onClick={this.toggleExpandImage}>
        <img
          src={src}
          width={expandedWidth}
          alt={alt}
          height={maxHeight}
          className={rotate90 ? 'rotate90' : ''}
        />
      </div>
    );
  }
}

export default ExpandableImage;
