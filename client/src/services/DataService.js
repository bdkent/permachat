import _ from "lodash";

import ClassUtils from "../utils/ClassUtils";

class DataService {
  constructor(account, contract) {
    this.account = account;
    this.contract = contract;
    ClassUtils.bindAllMethods(DataService.prototype, this);

    this.txParams = {
      from: account
    };
  }

  async getLatestDBIndex() {
    const isDBUninitialized = await this.isDBUninitialized();

    if (isDBUninitialized) {
      return Promise.reject("db uninitialized");
    } else {
      const state = await this.contract.getLatestDatabaseState();
      return state.latestDatabaseIndex;
    }
  }

  async getLatestDBState() {
    // HMM, returns coming back from contract.getLatestDatabaseState are not right,
    // so load manually?

    // const nextActionId = await this.contract.nextActionId();

    const paidDatabaseIndex = await this.contract.paidDatabaseIndex();
    const latestDatabaseIndex = await this.contract.latestDatabaseIndex();

    // console.log(
    //   _.toString(nextActionId),
    //   _.toString(paidDatabaseIndex),
    //   _.toString(latestDatabaseIndex)
    // );

    const result = await this.contract.getLatestDatabaseState();
    // console.log(result);

    return _.assign({}, result, { paidDatabaseIndex, latestDatabaseIndex });
  }

  getDB(currentDatabaseIndex) {
    return this.contract.getDatabaseHash(currentDatabaseIndex);
  }

  async isDBUninitialized() {
    const result = await this.contract.latestDatabaseIndex();
    return result.toString() === "0";
  }

  async unlockLatestDatabase() {
    const result = await this.contract.unlockNewestDatabase(this.txParams);
    return result;
  }

  async unlockableUpdates() {
    const result = await this.contract.unlockableUpdates();
    return result;
  }
}

export default DataService;
