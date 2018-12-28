import Model from "../services/Model";

class IndexerContractService {
  constructor(contract, account) {
    this.contract = contract;
    this.account = account;

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
}

export default IndexerContractService;
