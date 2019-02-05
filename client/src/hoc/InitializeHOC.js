// import _ from "lodash";
import React from "react";

const InitializeHOC = (initialize, WrappedComponent) => {

  return class extends React.Component {
    componentDidMount() {
      initialize(this.props);
    }

    render() {
      return (<WrappedComponent {...this.props} />);
    }
  };
};

export default InitializeHOC;