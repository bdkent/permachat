import _ from "lodash";

import React from "react";

const DerivedStateHOC = (
  WrappedComponent,
  propertyNameToDerivedStateFunctions
) => {
  const names = _.keys(propertyNameToDerivedStateFunctions);

  const didNonFunctionPropChange = (newProps, oldProps) => {
    return _.some(newProps, (v, k) => {
      return !_.isFunction(newProps[k]) && newProps[k] !== oldProps[k];
    });
  };

  return class extends React.Component {
    state = {
      loaded: false,
      derived: {}
    };

    componentDidMount = () => {
      // console.log("componentDidMount", this.props);
      this.refresh(this.props);
    };

    componentWillReceiveProps = newProps => {
      // console.log("componentWillReceiveProps", newProps, this.props);
      if (didNonFunctionPropChange(newProps, this.props)) {
        this.refresh(newProps);
      }
    };

    async refresh(props) {
      // console.log("refresh", props);

      this.setState({
        loaded: false
      });

      const results = await Promise.all(
        _.map(names, n => {
          try {
            return Promise.resolve(
              propertyNameToDerivedStateFunctions[n](props)
            );
          } catch (e) {
            return Promise.reject(e);
          }
        })
      );
      const derived = _.reduce(
        results,
        (deps, v, k) => {
          deps[names[k]] = v;
          return deps;
        },
        {}
      );

      this.setState({
        derived,
        loaded: true
      });
    }

    render() {
      const props = this.state.loaded ? this.state.derived : {};
      return <WrappedComponent {...this.props} {...props} />;
    }
  };
};

export default DerivedStateHOC;
