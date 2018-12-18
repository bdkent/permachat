import _ from "lodash";

import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBug } from "@fortawesome/free-solid-svg-icons";

const toValueGenerator = property => {
  if (_.isString(property)) {
    return props => _.get(props, [property]);
  } else if (_.isFunction(property)) {
    return props => property(props);
  } else {
    throw new Error("SwitchHOC: unexpected property type: '" + property + "'");
  }
};

const errorMessage = (property, value) => {
  return (
    "unmapped component for property '" +
    property +
    "' with value '" +
    value +
    "'"
  );
};

const SwitchHOC = (property, ComponentMapping) => {
  const valueGenerator = toValueGenerator(property);
  return props => {
    const value = _.toString(valueGenerator(props));
    const Component = _.get(ComponentMapping, [value]);
    if (_.isNil(value) || _.isNil(Component)) {
      return (
        <span title={errorMessage(property, value)} className="text-danger">
          <FontAwesomeIcon icon={faBug} size="5x" />
        </span>
      );
    } else {
      return <Component {...props} />;
    }
  };
};

export default SwitchHOC;
