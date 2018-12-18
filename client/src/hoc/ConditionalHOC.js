import _ from "lodash";
import React, { Component } from "react";

function toPredicate(predicateOrName) {
  if (_.isFunction(predicateOrName)) {
    return predicateOrName;
  } else if (_.isString(predicateOrName)) {
    return props => !!props[predicateOrName];
  } else if (_.isArray(predicateOrName)) {
    return props => _.every(predicateOrName, n => toPredicate(n));
  } else {
    return props => !!props.show;
  }
}

function ConditionalHOC(WrappedComponent, predicateOrName) {
  const predicate = toPredicate(predicateOrName);
  return class extends Component {
    state = { show: predicate(this.props) };

    componentWillReceiveProps = newProps => {
      this.setState({
        show: predicate(newProps)
      });
    };

    render() {
      if (this.state.show) {
        return <WrappedComponent {...this.props} />;
      } else {
        return null;
      }
    }
  };
}

export default ConditionalHOC;
