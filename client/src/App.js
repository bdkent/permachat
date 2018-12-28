import _ from "lodash";
import React, { Component } from "react";

import PermaChatContract from "./contracts/PermaChat.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import localForage from "localforage";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";

import "bootstrap/dist/css/bootstrap.min.css";

import { Alert } from "reactstrap";

import PermaChat from "./PermaChat";
import AnonymousBlurb from "./widgets/AnonymousBlurb";

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
          you are running on the <strong>{props.networkType}</strong> network
        </Alert>
      );
  }
};

class App extends Component {
  state = {
    loading: true,
    web3: null,
    accounts: null,
    contract: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      const contract = await deployContract(web3, PermaChatContract);

      const networkType = await web3.eth.net.getNetworkType();

      // console.log("PermaChatContract", PermaChatContract);
      // console.log("contract", contract);

      localForage.config({
        storeName: "permachat"
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
        loading: false,
        web3,
        networkType,
        accounts,
        contract,
        contracts: [{ definition: PermaChatContract, instance: contract }]
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.log(error);
    }
  };

  render() {
    if (this.state.loading) {
      return (
        <div className="container text-center text-info">
          <FontAwesomeIcon icon={faSyncAlt} spin size="5x" />
        </div>
      );
    } else {
      if (_.isNil(this.state.web3)) {
        return (
          <div className="container">
            <AnonymousBlurb />
          </div>
        );
      } else {
        return (
          <div className="">
            <NetworkBanner networkType={this.state.networkType} />
            <PermaChat
              accounts={this.state.accounts}
              contract={this.state.contract}
              contracts={this.state.contracts}
              web3={this.state.web3}
            />
          </div>
        );
      }
    }
  }
}

export default App;
