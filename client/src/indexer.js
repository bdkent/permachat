import _ from "lodash";

import fs from "fs";

import PermaChatContract from "./contracts/PermaChat.json";
import truffleContract from "truffle-contract";
import Web3 from "web3";
import Minimist from "minimist";
import "./logger-init.js";
import ipfs from "./utils/ipfs-local";

import IndexerContractService from "./indexer/IndexerContractService";
import ScheduledIndexer from "./indexer/ScheduledIndexer";
import IndexPricer from "./indexer/IndexPricer";

import dotenv from "dotenv";
dotenv.config();

const getSecret = name => {
  const dockerSecretPath = "/run/secrets/" + name;
  if (fs.existsSync(dockerSecretPath)) {
    return _.trim(fs.readFileSync(dockerSecretPath, "utf8"));
  }
  const fromEnv = getEnv(name);
  if (!_.isNil(fromEnv)) {
    return fromEnv;
  }
  logger.error("cannot find secret", name);
  return null;
};

const toEnvName = name => {
  return _.replace(_.toUpper(name), new RegExp("\\.", "g"), "_");
};

const getEnv = name => {
  return process.env[name] || process.env[toEnvName(name)];
};

const newNetworkConfig = () => {
  const address = getEnv("permachat.ethereum.ws.address") || "127.0.0.1";
  const port = getEnv("permachat.ethereum.ws.port") || "7545";
  const uri = "ws://" + address + ":" + port;
  logger.info("ethereum uri", uri);
  return {
    provider: new Web3.providers.WebsocketProvider(uri),
    networkAccount: getSecret("permachat.indexer.admin.address"),
    password: getSecret("permachat.indexer.admin.password")
  };
};

const newWeb3 = provider => {
  return new Promise((resolve, reject) => {
    var count = 0;

    const MaxRetryAttempts = 50;
    const ConnectIntervalMs = 1000 * 5;

    const tryCreate = async () => {
      logger.debug("web3 creation attempt", ++count);
      try {
        const web3 = new Web3(provider);
        if (_.isNil(web3)) {
          return Promise.reject("unable to create web3");
        } else {
          const isListening = await web3.eth.net.isListening();
          if (isListening) {
            logger.info("web3 is listening successfully");
            return Promise.resolve(web3);
          } else {
            return Promise.reject("unable to connect with web3");
          }
        }
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const attempt = () => {
      tryCreate()
        .then(resolve)
        .catch(e => {
          if (count < MaxRetryAttempts) {
            setTimeout(attempt, ConnectIntervalMs);
          } else {
            reject(
              "count not create Web3 connections, after " + count + " attempts"
            );
          }
        });
    };

    attempt();
  });
};

const config = async () => {
  const { provider, networkAccount, password } = newNetworkConfig();
  console.log("provider", !_.isNil(provider), networkAccount);

  const web3 = await newWeb3(provider);
  console.log("web3", !_.isNil(web3));

  const network = await web3.eth.net.getNetworkType();
  console.log("NETWORK", network);

  // Use web3 to get the user's accounts.
  const accounts = await web3.eth.getAccounts();
  console.log("accounts", accounts);

  const account = networkAccount || accounts[0];
  console.log("account", account);

  web3.eth.defaultAccount = account;
  console.log("defaultAccount", web3.eth.defaultAccount);

  const balance = await web3.eth.getBalance(account);
  console.log("balance", balance, web3.utils.fromWei(balance));

  if (!_.isNil(password)) {
    await web3.eth.personal.unlockAccount(networkAccount, password);
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

const init = async () => {
  const { web3, accounts, account, contract } = await config();

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

  contract.NewActionEvent((error, result) => {
    scheduledIndexer.index();
  });
};

const reset = async () => {
  const { web3, accounts, account, contract } = await config();

  const dir = "/empty-" + String(Math.random() + Date.now());
  await ipfs.files.mkdir(dir);
  const stat = await ipfs.files.stat(dir);
  const newDbHash = stat.hash;
  await contract.resetDatabase({ from: account });

  console.log("db reset");
};

// console.log("argv", process.argv);
//
// console.log("env", process.env);
//
// const args = Minimist(process.argv);
// console.log("args", args);
//
// const networkType = args.network || "private";
// console.log("network type", networkType);
//
// const address = args.address || "127.0.0.1";
// console.log("address", address);
//
// const port = args.port;
// console.log("port", port);

init(); //{ networkType, address, port });
// reset(networkType);
