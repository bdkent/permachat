import _ from "lodash";

import PermaChatContract from "./contracts/PermaChat.json";
import truffleContract from "truffle-contract";
import Web3 from "web3";
import Minimist from "minimist";
import "./logger-init.js";
import ipfs from "./utils/ipfs-local";

import IndexerContractService from "./indexer/IndexerContractService";
import ScheduledIndexer from "./indexer/ScheduledIndexer";
import IndexPricer from "./indexer/IndexPricer";

const newNetworkConfig = networkType => {
  switch (networkType) {
    case "private":
    case "ganache":
      return {
        provider: new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545")
      };
    case "rinkeby":
      return {
        // provider: new Web3.providers.WebsocketProvider(
        //   "wss://rinkeby.infura.io/ws"
        // )
        // ,
        // WSS ???
        provider: new Web3.providers.WebsocketProvider("ws://127.0.0.1:8546"),
        networkAccount: process.env.PERMACHAT_ACCOUNT,
        password: process.env.PERMACHAT_PASSWORD
      };
    default:
      throw new Error("unknown network: " + networkType);
  }
};

const config = async networkType => {
  const { provider, networkAccount, password } = newNetworkConfig(networkType);

  const web3 = new Web3(provider);

  const network = await web3.eth.net.getNetworkType();
  console.log("NETWORK", network);

  // Use web3 to get the user's accounts.
  const accounts = await web3.eth.getAccounts();
  console.log("accounts", accounts);

  const account = networkAccount || accounts[0];
  console.log("account", account);

  const balance = await web3.eth.getBalance(account);
  console.log("balance", balance, web3.utils.fromWei(balance));

  if (!_.isNil(password)) {
    await web3.eth.personal.unlockAccount(networkAccount, password); //, 600);
  }

  const Contract = truffleContract(PermaChatContract);
  Contract.setProvider(web3.currentProvider);
  const contract = await Contract.deployed();

  console.log("READY");

  return {
    web3,
    accounts,
    account,
    contract
  };
};

const init = async networkType => {
  const { web3, accounts, account, contract } = await config(networkType);

  const indexerContractService = new IndexerContractService(
    contract,
    account,
    web3
  );

  const indexPricer = new IndexPricer(indexerContractService);
  indexPricer.start();

  const scheduledIndexer = new ScheduledIndexer(indexerContractService);
  scheduledIndexer.start();
  scheduledIndexer.index();

  contract.NewPostEvent((error, result) => {
    scheduledIndexer.index();
  });

  contract.NewReplyEvent((error, result) => {
    scheduledIndexer.index();
  });

  contract.NewCommentaryEvent((error, result) => {
    scheduledIndexer.index();
  });
};

const reset = async networkType => {
  const { web3, accounts, account, contract } = await config(networkType);

  const dir = "/empty-" + String(Math.random() + Date.now());
  await ipfs.files.mkdir(dir);
  const stat = await ipfs.files.stat(dir);
  const newDbHash = stat.hash;
  await contract.setDatabaseIndex(1, stat.hash, { from: account });

  console.log("db reset");
};

console.log("argv", process.argv);

const args = Minimist(process.argv);
console.log("args", args);

const networkType = args.network || "private";
console.log("network type", networkType);

init(networkType);
// reset(networkType);
