import _ from "lodash";

import LoadingHOC from "./LoadingHOC";
import DerivedStateHOC from "./DerivedStateHOC";
import ConditionalHOC from "./ConditionalHOC";

const LoadableHOC = (WrappedComponent, propertyNameToDerivedStateFunctions) => {
  const loadableProperties = _.keys(propertyNameToDerivedStateFunctions);
  const show = props =>
    _.every(loadableProperties, p => !_.isUndefined(props[p]));
  return DerivedStateHOC(
    LoadingHOC(loadableProperties, ConditionalHOC(WrappedComponent, show)),
    propertyNameToDerivedStateFunctions
  );
};

export default LoadableHOC;
