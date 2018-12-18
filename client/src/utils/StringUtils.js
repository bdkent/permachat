import _ from "lodash";

const StringUtils = {
  mkString: (xs, sep, pre, post) => {
    if (_.isEmpty(xs)) {
      return "";
    } else {
      return pre + _.join(xs, sep) + post;
    }
  }
};

export default StringUtils;
