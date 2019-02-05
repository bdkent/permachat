// import _ from "lodash";

import {createLogger} from "redux-logger";
import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import {connectRouter, routerMiddleware} from "connected-react-router";
import thunkMiddleware from "redux-thunk";
import {createHashHistory as createHistory} from "history";

import * as Reducers from "../state/reducers";
import ipfs from "../utils/ipfs-infura";

export function newReduxStore(api) {
  const history = createHistory();

  const DefaultStore = {};

  const loggerMiddleware = createLogger();

  const thunkExtras = {...api, ipfs};

  const store = createStore(
    combineReducers({
      ...Reducers,
      router: connectRouter(history)
    }), DefaultStore, compose(applyMiddleware(thunkMiddleware.withExtraArgument(thunkExtras), loggerMiddleware, routerMiddleware(history))));

  return {
    history, store
  };
}