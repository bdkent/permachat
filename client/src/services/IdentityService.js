import _ from "lodash";

import ContractHelper from "./ContractHelper";

import ClassUtils from "../utils/ClassUtils";

import * as Actions from "../state/actions";

const toNumber = n => {
  if (_.isNil(n)) {
    return n;
  } else {
    if (_.isNumber(n)) {
      return n;
    } else {
      return parseInt(n.toString());
    }
  }
};

class IdentityService {
  constructor(store, contract, account, web3) {
    this.contract = contract;
    this.account = account;
    this.web3 = web3;

    this.txParams = {
      from: account
    };

    ClassUtils.bindAllMethods(IdentityService.prototype, this);

    const schedule = (f, ms) => {
      f();
      setInterval(f, ms);
    };

    schedule(() => store.dispatch(Actions.refreshIdentityRequestPrice()), 1000 * 60 * 10);

  }

  setActiveAccount(account) {
    this.account = account;
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
      return self.getIdentityProvidersFromIdentity(identity);
    }
  }

  async getIdentityProvidersFromIdentity(identity) {
    const self = this;
    if (_.isNil(identity)) {
      return [];
    } else {
      const {id, providerCount} = identity;
      const providers = await Promise.all(
        _.map(_.range(toNumber(providerCount)), async index => {
          try {
            const provider = await self.contract.getProviderInfo(id, index);
            const request = await self.contract.getRequestById(
              provider.requestId
            );
            return _.assign({}, provider, {request});
          } catch (e) {
            console.error(
              "bad identity provider",
              identity,
              providerCount,
              index
            );
            return null;
          }
        })
      );
      return _.compact(providers);
    }
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
        _.assign({}, this.txParams, {value: priceInWei})
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

}

export default IdentityService;
