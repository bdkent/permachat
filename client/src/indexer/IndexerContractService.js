import _ from "lodash";

import Model from "../services/Model";

import BN from "bn.js";

import LogUtils from "../utils/LogUtils";

LogUtils.setLowest(logger, "info");

const UnlockMultiplier = 5;

class IndexerContractService {
  constructor(contract, account, web3) {
    this.contract = contract;
    this.account = account;
    this.web3 = web3;

    this.txParams = {
      from: this.account
    };
  }

  async setDatabaseIndex(newIndex, newHash) {
    return await this.contract.setDatabaseIndex(
      newIndex,
      newHash,
      this.txParams
    );
  }

  async getLatestDatabaseState() {
    return await this.contract.getLatestDatabaseState();
  }

  async getAction(databaseIndex) {
    return await this.contract.getAction(databaseIndex);
  }

  async getPost(postId) {
    const contractPost = await this.contract.getPost(postId);
    return Model.Post.fromPermaChatContract(contractPost);
  }

  async setUnlockPrice(averageGasPrice) {
    if (averageGasPrice <= 0) {
      // nope
      return 0;
    } else {
      const averageGasPriceBN = new BN(averageGasPrice.toString());
      const priceInWei = this.web3.utils.toWei(averageGasPriceBN, "gwei");
      const newUnlockPrice = priceInWei.muln(UnlockMultiplier);
      logger.debug("newUnlockPrice", newUnlockPrice);
      const currentUnlockPrice = await this.contract.unlockPrice();
      logger.debug("currentUnlockPrice", currentUnlockPrice);

      if (!newUnlockPrice.eq(currentUnlockPrice)) {
        await this.contract.setUnlockPrice(newUnlockPrice, this.txParams);
      } else {
        // did not change
      }

      logger.info("unlock price updated", _.toString(newUnlockPrice));

      return newUnlockPrice;
    }
  }
}

export default IndexerContractService;
