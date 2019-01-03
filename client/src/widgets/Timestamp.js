import _ from "lodash";
import React from "react";
import Moment from "react-moment";

import ConditionalHOC from "../hoc/ConditionalHOC";

const toTimestampNumber = timestampLike => {
  if (_.isNumber(timestampLike)) {
    return timestampLike;
  } else {
    const str = _.toString(timestampLike);

    const asInt = parseInt(str);
    if (_.toString(asInt) === str) {
      return asInt;
    } else {
      console.error("expected valid timestamp", timestampLike);
      return null;
    }
  }
};

const Timestamp = ConditionalHOC(({ timestamp }) => {
  const num = toTimestampNumber(timestamp);
  return <Moment fromNow>{new Date(num).toUTCString()}</Moment>;
}, "timestamp");

export default Timestamp;
