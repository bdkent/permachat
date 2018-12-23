//import _ from "lodash";
import React from "react";
import Moment from "react-moment";

import ConditionalHOC from "../hoc/ConditionalHOC";

const Timestamp = ConditionalHOC(({ timestamp }) => {
  return <Moment fromNow>{new Date(parseInt(timestamp)).toUTCString()}</Moment>;
}, "timestamp");

export default Timestamp;
