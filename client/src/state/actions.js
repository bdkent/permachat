import _ from "lodash";

import * as ActionTypes from "./actionTypes";
import ContractHelper from "../services/ContractHelper";

export function setAccounts(accounts) {
  return {
    type: ActionTypes.SET_ACCOUNTS,
    accounts
  };
}

export function setActiveAccount(account) {
  return {
    type: ActionTypes.SET_ACTIVE_ACCOUNT,
    account
  };
}

export function refreshIdentityRequestPrice() {
  return async (dispatch, getState, {contract}) => {
    const price = await contract.requestPrice();
    return dispatch({
      type: ActionTypes.REFRESH_IDENTITY_REQUEST_PRICE,
      value: price
    });
  };
}

function TxParams({activeAccount}) {
  this.from = activeAccount;
}

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

async function getIdentityProvidersFromIdentity(contract, identity, txParams) {
  if (_.isNil(identity)) {
    return [];
  } else {
    const {id, providerCount} = identity;
    const providers = await Promise.all(
      _.map(_.range(toNumber(providerCount)), async index => {
        try {
          const provider = await contract.getProviderInfo(id, index, txParams);
          const request = await contract.getRequestById(provider.requestId, txParams);
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

export function fetchMyIdentity() {
  return async (dispatch, getState, {contract}) => {
    const {myIdentity} = getState();
    if (_.isNil(myIdentity)) {
      const txParams = new TxParams(getState());
      const identity = await contract.getMyIdentityInfo(txParams);
      if (ContractHelper.isNullUint(identity)) {
        return Promise.resolve();
      } else {
        return dispatch({
          type: ActionTypes.FETCH_MY_IDENTITY,
          value: identity
        });
      }
    } else {
      return Promise.resolve();
    }
  };
}

export function fetchMyIdentityProviders() {
  return async (dispatch, getState, {contract}) => {
    await dispatch(fetchMyIdentity());
    const {myIdentity} = getState();
    if (!_.isNil(myIdentity)) {
      const txParams = new TxParams(getState());
      const providers = await getIdentityProvidersFromIdentity(contract, myIdentity, txParams);
      return dispatch({
        type: ActionTypes.FETCH_MY_IDENTITY_PROVIDERS,
        myIdentity: myIdentity,
        myIdentityProviders: providers
      });
    } else {
      return Promise.resolve();
    }
  };
}

export function fetchIdentityProviders(address) {
  return async (dispatch, getState, {contract}) => {
    const {identityProvidersMapping} = getState();
    if (_.isNil(identityProvidersMapping[address])) {
      const txParams = new TxParams(getState());
      const identity = await contract.getIdentityInfoByAddress(address, txParams);
      if (ContractHelper.isNullUint(identity)) {
        return dispatch({
          type: ActionTypes.FETCH_IDENTITY_PROVIDERS,
          address,
          identityProviders: []
        });
      } else {
        const providers = await getIdentityProvidersFromIdentity(contract, identity, txParams);
        return dispatch({
          type: ActionTypes.FETCH_IDENTITY_PROVIDERS,
          address,
          identityProviders: providers
        });
      }
    } else {
      return Promise.resolve();
    }
  };
}