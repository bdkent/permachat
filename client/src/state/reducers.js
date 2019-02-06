import _ from "lodash";
import * as ActionTypes from "./actionTypes";

export function providers(state = ["twitter", "github"], action) {
  return state;
}

export function accounts(state = [], action) {
  switch (action.type) {
    case ActionTypes.SET_ACCOUNTS:
      return action.accounts;
    default:
      return state;
  }
}

export function activeAccount(state = null, action) {
  switch (action.type) {
    case ActionTypes.SET_ACTIVE_ACCOUNT:
      return action.account;
    default:
      return state;
  }
}

export function identityRequestPriceInWei(state = null, action) {
  switch (action.type) {
    case ActionTypes.REFRESH_IDENTITY_REQUEST_PRICE:
      return action.value;
    default:
      return state;
  }
}

export function myIdentity(state = null, action) {
  switch (action.type) {
    case ActionTypes.FETCH_MY_IDENTITY:
      return action.value;
    case ActionTypes.FETCH_MY_IDENTITY_PROVIDERS:
      return action.myIdentity;
    default:
      return state;
  }
}

export function myIdentityProviders(state = null, action) {
  switch (action.type) {
    case ActionTypes.FETCH_MY_IDENTITY_PROVIDERS:
      return action.myIdentityProviders;
    default:
      return state;
  }
}

export function identityProvidersMapping(state = {}, action) {
  switch (action.type) {
    case ActionTypes.FETCH_IDENTITY_PROVIDERS:
      return _.assign({}, state, {[action.address]: action.identityProviders});
    default:
      return state;
  }
}

const DefaultIdentityRequestForm = {provider: "", username: "", token: "", evidence: ""};

export function identityRequestForm(state = DefaultIdentityRequestForm, action) {
  switch (action.type) {
    case ActionTypes.SET_IDENTITY_REQUEST_FORM_PROVIDER:
      return {provider: action.provider};
    case ActionTypes.SET_IDENTITY_REQUEST_FORM_USERNAME:
      return _.assign({}, state, {username: action.username, token: action.token});
    case ActionTypes.SET_IDENTITY_REQUEST_FORM_EVIDENCE:
      return _.assign({}, state, {evidence: action.evidence});
    case ActionTypes.RESET_IDENTITY_REQUEST_FORM_PROVIDER:
      return _.clone(DefaultIdentityRequestForm);
    default:
      return state;
  }
}