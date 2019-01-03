import _ from "lodash";
import React from "react";
import Moment from "react-moment";

import BN from "bn.js";

import ConditionalHOC from "../hoc/ConditionalHOC";

const toTimestampNumber = timestampLike => {
  if (_.isNumber(timestampLike)) {
    return timestampLike;
  } else if (BN.isBN(timestampLike)) {
    return timestampLike.toNumber();
  } else {
    const str = _.toString(timestampLike);
    const asInt = parseInt(str);
    if (_.toString(asInt) === str) {
      return asInt;
    } else {
      // probably BigNumber as String  ??
      return new BN(str, 16).toNumber();
    }
  }
};

const Timestamp = ConditionalHOC(({ timestamp }) => {
  const num = toTimestampNumber(timestamp);
  return <Moment fromNow>{new Date(num).toUTCString()}</Moment>;
}, "timestamp");

export default Timestamp;
