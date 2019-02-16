import _ from "lodash";

import {fetch} from "whatwg-fetch";

import * as ActionTypes from "./actionTypes";
import ContractHelper from "../services/ContractHelper";

export function setAccounts(accounts) {
  return {
    type: ActionTypes.SET_ACCOUNTS,
    accounts
  };
}

export function resetIdentityRequestForm() {
  return {
    type: ActionTypes.RESET_IDENTITY_REQUEST_FORM_PROVIDER
  };
}

export function setIdentityRequestFormProvider(provider) {
  return {
    type: ActionTypes.SET_IDENTITY_REQUEST_FORM_PROVIDER,
    provider
  };
}

export function setIdentityRequestFormUsername(username) {
  return async (dispatch, getState, {web3}) => {
    const {identityRequestForm: {provider}, activeAccount} = getState();
    const token = web3.utils.sha3(provider + username + activeAccount);
    return dispatch({
      type: ActionTypes.SET_IDENTITY_REQUEST_FORM_USERNAME,
      username,
      token
    });
  };
}

export function setIdentityRequestFormEvidence(evidence) {
  return {
    type: ActionTypes.SET_IDENTITY_REQUEST_FORM_EVIDENCE,
    evidence
  };
}

export function setActiveAccount(account) {
  return {
    type: ActionTypes.SET_ACTIVE_ACCOUNT,
    account
  };
}

export function doIdentityRequest(provider, username, evidence) {
  return async (dispatch, getState, {contract}) => {
    const price = await contract.requestPrice();
    const txParams = new TxParams(getState());
    txParams.value = price;
    try {
      const result = await contract.submitRequest(provider, username, evidence, txParams);
      return dispatch({
        type: ActionTypes.DO_IDENTITY_REQUEST,
        result,
        provider,
        username,
        evidence
      });
    } catch (e) {
      console.error(
        "error",
        "requestIdentity",
        provider,
        username,
        evidence,
        e
      );
    }

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

export function refreshEtherPrice() {
  return async (dispatch, getState) => {

    const result = await fetch(
      "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR"
    );
    const json = await result.json();

    const price = json.USD * 100;
    const now = new Date().getTime();

    return dispatch({
      type: ActionTypes.REFRESH_ETHER_PRICE,
      value: {
        timestamp: now,
        priceInCents: price
      }
    });
  };
}