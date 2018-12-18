import React from "react";

const HoverHOC = (WrappedComponent, customProperty) => {
  const property = customProperty || "isHovering";
  return class extends React.Component {
    state = {
      hover: false
    };

    constructor(props) {
      super(props);

      this.mouseEnter = this.mouseEnter.bind(this);
      this.mouseLeave = this.mouseLeave.bind(this);
    }

    mouseEnter = () => {
      this.setState({ hover: true });
    };

    mouseLeave = () => {
      this.setState({ hover: false });
    };

    render() {
      const props = {};
      props[property] = this.state.hover;

      return (
        <div onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
          <WrappedComponent {...this.props} {...props} />
        </div>
      );
    }
  };
};

export default HoverHOC;
