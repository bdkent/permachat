import _ from "lodash";

const BigNumberUtils = {
  eq: (x, y) => _.toString(x) === _.toString(y)
};

export default BigNumberUtils;
