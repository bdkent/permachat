import _ from "lodash";

const ContractHelper = {
  isNullUint: uint => {
    return _.isNil(uint) || uint.toString() === "0";
  },

  normalizeUint: uint => {
    if (ContractHelper.isNullUint(uint)) {
      return null;
    } else {
      return uint;
    }
  }
};

export default ContractHelper;
