import _ from "lodash";
// import React from "react";

import SwitchHOC from "./SwitchHOC";

const IfElseHOC = (property, IfComponent, ElseComponent) => {
  const toValue = props => {
    if (_.toString(property)) {
      return !!props[property];
    } else if (_.isFunction(property)) {
      return !!property(props);
    } else {
      throw new Error(
        "IfElseHOC: unexpected property type: '" + property + "'"
      );
    }
  };

  return SwitchHOC(toValue, {
    true: IfComponent,
    false: ElseComponent
  });
};

export default IfElseHOC;
