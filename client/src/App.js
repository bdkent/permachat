import React, { Component } from "react";

import PermaChatContract from "./contracts/PermaChat.json";
import getWeb3 from "./utils/getWeb3";
import truffleContract from "truffle-contract";
import localForage from "localforage";

import "bootstrap/dist/css/bootstrap.min.css";

import { Alert } from "reactstrap";

import Tweeter from "./Tweeter.js";

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

      this.setState({
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
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div className="">
        <NetworkBanner networkType={this.state.networkType} />
        <Tweeter
          accounts={this.state.accounts}
          contract={this.state.contract}
          contracts={this.state.contracts}
          web3={this.state.web3}
        />
      </div>
    );
  }
}

export default App;
