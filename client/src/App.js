import _ from "lodash";
import React, {Component} from "react";

import PermaChatContract from "./contracts/PermaChat.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import localForage from "localforage";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSyncAlt} from "@fortawesome/free-solid-svg-icons";

import "bootstrap/dist/css/bootstrap.min.css";

import {Alert} from "reactstrap";

import {ConnectedRouter} from "connected-react-router";

import {Provider} from "react-redux";

import PermaChat from "./PermaChat";
import AnonymousBlurb from "./widgets/AnonymousBlurb";

import * as Actions from "./state/actions";

import {newReduxStore} from "./utils/ReduxUtils";

import Scheduler from "./services/Scheduler";

const deployContract = async (web3, contractDefinition) => {
  const contract = truffleContract(contractDefinition);
  contract.setProvider(web3.currentProvider);
  return await contract.deployed();
};

const NetworkBanner = props => {
  switch (props.networkType) {
    case "main":
      return null;
    default:
      return (
        <Alert color="info" className="text-center">
          you are running on the{" "}
          <strong>{props.networkType || "UNKNOWN"}</strong> network
        </Alert>
      );
  }
};

const ErrorType = {
  NoWeb3: "no-web3",
  UnconnectedWeb3: "unconnected-web3",
  NoContract: "no-contract",
  UnknownNetwork: "unknown-network",
  Unknown: "unknown"
};

class App extends Component {
  state = {
    loading: true,
    error: null,
    web3: null,
    accounts: null,
    contract: null
  };

  constructor(props) {
    super(props);
    this.withError = this.withError.bind(this);
  }

  withError(errorType) {
    const self = this;
    return error => {
      console.log("withError", errorType, error);
      self.setState({
        loading: false,
        error: errorType
      });
      return Promise.reject(error);
    };
  }

  componentDidMount = async () => {
    localForage.config({
      storeName: "permachat"
    });

    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3().catch(this.withError(ErrorType.NoWeb3));
      this.setState({web3});

      await web3.eth.net.isListening().catch(this.withError(ErrorType.UnconnectedWeb3));

      const networkType = await web3.eth.net.getNetworkType().catch(this.withError(ErrorType.UnknownNetwork));

      this.setState({networkType});
      const accounts = await web3.eth.getAccounts();

      this.setState({accounts});
      const contract = await deployContract(web3, PermaChatContract).catch(
        this.withError(ErrorType.NoContract)
      );

      const {store, history} = newReduxStore({web3, contract});

      await store.dispatch(Actions.setAccounts(accounts));
      await store.dispatch(Actions.setActiveAccount(_.head(accounts)));
      await Scheduler.startImmediate(() => store.dispatch(Actions.refreshIdentityRequestPrice()), 1000 * 60 * 10);
      await Scheduler.startImmediate(() => store.dispatch(Actions.refreshEtherPrice()), 1000 * 60 * 10);
      await store.dispatch(Actions.fetchMyIdentityProviders());

      this.setState({
        contract,
        contracts: [{definition: PermaChatContract, instance: contract}],
        store,
        history
      });

      localForage.getItem("permachat-contract").then(storedAddress => {
        if (!_.isNil(storedAddress) && storedAddress !== contract.address) {
          console.log(
            "different contract, clearing cache",
            "old:",
            storedAddress,
            "new:",
            contract.address
          );
          localForage.clear();
        }

        localForage.setItem("permachat-contract", contract.address);
      });

      this.setState({
        loading: false
      });
    } catch (error) {
      if (_.isNil(this.state.error)) {
        console.log("Failed to load web3, accounts, or contract.");
        console.log(error);

        this.setState({
          loading: false,
          error: ErrorType.Unknown
        });
      }
    }
  };

  render() {
    if (this.state.loading) {
      return (
        <div className="container text-center text-info">
          <FontAwesomeIcon icon={faSyncAlt} spin size="5x"/>
        </div>
      );
    } else {
      if (_.isNil(this.state.error) && !_.isNil(this.state.store) && !_.isNil(this.state.history)) {
        return (
          <Provider store={this.state.store}>
            <ConnectedRouter history={this.state.history}>
              <div>
                <NetworkBanner networkType={this.state.networkType}/>
                <PermaChat
                  store={this.state.store}
                  accounts={this.state.accounts}
                  contract={this.state.contract}
                  contracts={this.state.contracts}
                  web3={this.state.web3}
                />
              </div>
            </ConnectedRouter>
          </Provider>
        );
      } else {
        switch (this.state.error) {
          case ErrorType.NoWeb3:
          case ErrorType.UnconnectedWeb3: {
            return (
              <div className="pt-4">
                <div className="container">
                  <AnonymousBlurb/>
                </div>
              </div>
            );
          }
          case ErrorType.UnknownNetwork: {
            return (
              <div className="pt-4">
                <div className="container ">
                  <Alert color="danger" className="text-center">
                    <h3>
                      Could not determine Ethereum network for some reason...
                    </h3>
                    <p>
                      You can try switching to a different Ethereum network
                      through MetaMask.
                    </p>
                  </Alert>
                </div>
              </div>
            );
          }
          case ErrorType.NoContract: {
            return (
              <div>
                <NetworkBanner networkType={this.state.networkType}/>
                <div className="container">
                  <Alert color="danger" className="text-center">
                    <h3>
                      The Permachat smart contract has <strong>not</strong> been
                      deployed to this network.
                    </h3>
                    <p>
                      You can try switching to a different Ethereum network
                      through MetaMask.
                    </p>
                  </Alert>
                </div>
              </div>
            );
          }

          default: {
            console.log("state", this.state);
            return (
              <div>
                <NetworkBanner networkType={this.state.networkType}/>
                <div className="container">
                  <Alert color="danger" className="text-center">
                    <h3>Unknown Error</h3>
                  </Alert>
                </div>
              </div>
            );
          }
        }
      }
    }
  }
}

export default App;
