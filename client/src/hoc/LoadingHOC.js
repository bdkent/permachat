import _ from "lodash";
import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";

const LoadingHOC = (loadableProperties, WrappedComponent) => {
  // TODO: add very brief timeout period befor showing loader
  return props => {
    if (_.every(loadableProperties, p => !_.isUndefined(props[p]))) {
      return <WrappedComponent {...props} />;
    } else {
      return (
        <div className="text-center">
          <FontAwesomeIcon icon={faSyncAlt} spin size="3x" />
        </div>
      );
    }
  };
};

export default LoadingHOC;
