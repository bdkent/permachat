import _ from "lodash";
// import { fetch } from "whatwg-fetch";

import ContractHelper from "./ContractHelper";

import ClassUtils from "../utils/ClassUtils";

class IdentityService {
  constructor(contract, account, web3) {
    this.contract = contract;
    this.account = account;
    this.web3 = web3;

    this.txParams = {
      from: account
    };

    ClassUtils.bindAllMethods(IdentityService.prototype, this);
  }

  setActiveAccount(account) {
    this.account = account;
  }

  async isMe(address) {
    const providers = await this.getMyIdentityProviders();
    return _.some(providers, p => p.identityAddress === address);
  }

  async getMyIdentity() {
    try {
      const result = await this.contract.getMyIdentityInfo(this.txParams);
      if (ContractHelper.isNullUint(result.id)) {
        return null;
      } else {
        return result;
      }
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getIdentity(address) {
    try {
      const result = await this.contract.getIdentityInfoByAddress(
        address,
        this.txParams
      );
      if (ContractHelper.isNullUint(result.id)) {
        return null;
      } else {
        return result;
      }
    } catch (e) {
      // console.error(e);
      return null;
    }
  }

  async getIdentityProviders(address) {
    const self = this;
    const identity = await this.getIdentity(address);
    if (_.isNil(identity)) {
      return [];
    } else {
      const { id, providerCount } = identity;
      const providers = await Promise.all(
        _.map(_.range(providerCount), async index => {
          const provider = await self.contract.getProviderInfo(id, index);
          const request = await this.contract.getRequestById(
            provider.requestId
          );
          return _.assign({}, provider, { request });
        })
      );

      return providers;
    }
  }

  async getMyIdentityProviders() {
    const self = this;
    const myIdentity = await this.getMyIdentity();
    if (_.isNil(myIdentity)) {
      return [];
    } else {
      const { providerCount } = myIdentity;
      const providers = await Promise.all(
        _.map(_.range(providerCount), async index => {
          const provider = await self.contract.getMyProviderInfo(index);
          const request = await this.contract.getRequestById(
            provider.requestId
          );
          return _.assign({}, provider, { request });
        })
      );

      return providers;
    }
  }

  async getProviders() {
    return ["twitter", "github"];
  }

  async createToken(provider, userName) {
    return this.web3.utils.sha3(provider + userName + this.account);
  }

  async requestIdentity(provider, userName, identifier) {
    const priceInWei = await this.contract.requestPrice();
    try {
      return await this.contract.submitRequest(
        provider,
        userName,
        identifier,
        _.assign({}, this.txParams, { value: priceInWei })
      );
    } catch (e) {
      console.error(
        "error",
        "requestIdentity",
        provider,
        userName,
        identifier,
        e
      );
    }
  }

  async getRequestById(requestId) {
    return await this.contract.getRequestById(requestId);
  }

  async getRequestPriceInWei() {
    const priceInWei = await this.contract.requestPrice();
    return priceInWei;
  }
}

export default IdentityService;
