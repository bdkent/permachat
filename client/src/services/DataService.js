import ClassUtils from "../utils/ClassUtils";

class DataService {
  constructor(contract) {
    this.contract = contract;
    ClassUtils.bindAllMethods(DataService.prototype, this);
  }

  getLatestDBIndex() {
    return this.contract
      .getLatestDBIndex()
      .then(uintIndex => parseInt(uintIndex.toString()));
  }

  getDB(currentDatabaseIndex) {
    return this.contract.getDB(currentDatabaseIndex);
  }
}

export default DataService;
