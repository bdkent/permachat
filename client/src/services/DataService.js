import _ from "lodash";

import Multihash from "../utils/Multihash";
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
    const {multihashDigest, multihashHashFunction, multihashSize} = result;
    const ipfsHash = Multihash.getMultihashFromBytes32({
      digest: multihashDigest,
      hashFunction: multihashHashFunction,
      size: multihashSize
    });
    // console.log(result);

    return _.assign({}, result, {
      ipfsHash,
      paidDatabaseIndex,
      latestDatabaseIndex
    });
  }

  async getDB(currentDatabaseIndex) {
    const result = await this.contract.getDatabaseHash(currentDatabaseIndex);
    const {multihashDigest, multihashHashFunction, multihashSize} = result;
    return Multihash.getMultihashFromBytes32({
      digest: multihashDigest,
      hashFunction: multihashHashFunction,
      size: multihashSize
    });
  }

  async isDBUninitialized() {
    const result = await this.contract.latestDatabaseIndex();
    return result.toString() === "0";
  }

  async unlockLatestDatabase() {
    const price = await this.contract.unlockPrice();
    const txParams = _.clone(this.txParams);
    txParams.value = price;
    const result = await this.contract.unlockNewestDatabase(txParams);
    return result;
  }

  async unlockableUpdates() {
    const result = await this.contract.unlockableUpdates();
    return result;
  }
}

export default DataService;
