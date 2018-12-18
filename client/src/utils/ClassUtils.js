import _ from "lodash";

const ClassUtils = {
  bindAllMethods(classPrototype, _this) {
    _.forEach(Object.getOwnPropertyNames(classPrototype), property => {
      if (property !== "constructor" && _.isFunction(_this[property])) {
        _this[property] = _this[property].bind(_this);
      }
    });
  }
};

export default ClassUtils;
