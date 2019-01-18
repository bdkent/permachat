import _ from "lodash";

import fs from "fs";

import PermaChatContract from "./contracts/PermaChat.json";
import truffleContract from "truffle-contract";
import Web3 from "web3";
import Minimist from "minimist";
import "./logger-init.js";
import IPFS from "ipfs-http-client";

import IndexerContractService from "./indexer/IndexerContractService";
import ScheduledIndexer from "./indexer/ScheduledIndexer";
import IndexPricer from "./indexer/IndexPricer";

import dotenv from "dotenv";
dotenv.config();

const getSecret = name => {
  const dockerSecretPath = "/run/secrets/" + name;
  if (fs.existsSync(dockerSecretPath)) {
    const maybeSecret = _.trim(fs.readFileSync(dockerSecretPath, "utf8"));
    if (!_.isEmpty(maybeSecret)) {
      return maybeSecret;
    }
  }
  const fromEnv = getEnv(name);
  if (!_.isNil(fromEnv)) {
    return fromEnv;
  }
  logger.error("cannot find secret", name);
  return null;
};

const getEnv = name => {
  return process.env[name];
};

const newNetworkConfig = () => {
  const address = getEnv("PERMACHAT_ETHEREUM_WS_ADDRESS") || "127.0.0.1";
  const port = getEnv("PERMACHAT_ETHEREUM_WS_PORT") || "7545";
  const uri = "ws://" + address + ":" + port;
  logger.info("ethereum uri", uri);
  return {
    provider: new Web3.providers.WebsocketProvider(uri),
    networkAccount: getEnv("PERMACHAT_INDEXER_ADMIN_ADDRESS"),
    password: getSecret("PERMACHAT_INDEXER_ADMIN_PASSWORD"),
    privateKey: getSecret("PERMACHAT_INDEXER_ADMIN_PRIVATEKEY")
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
            const peers = await web3.eth.net.getPeerCount();
            if (peers > 0) {
              logger.info("web3 has peers: |", peers, "|");
              return Promise.resolve(web3);
            } else {
              return Promise.reject("unable to connect to peers");
            }
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
            logger.warn("trouble:", _.toString(e));
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
  const { provider, networkAccount, password, privateKey } = newNetworkConfig();
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

  if (!_.isEmpty(privateKey)) {
    if (!_.isEmpty(password)) {
      if (!_.includes(accounts, account)) {
        await web3.eth.personal.importRawKey(privateKey, password);
        console.log("added account");
      }

      await web3.eth.personal.unlockAccount(account, password);
      console.log("unlocked account");
    } else {
      console.warn("no password provided");
    }
  } else {
    console.warn("no private key provided");
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

  const ipfs = new IPFS({
    host: getEnv("PERMACHAT_IPFS_ADDRESS"),
    port: getEnv("PERMACHAT_IPFS_PORT"),
    protocol: "http"
  });

  const indexerContractService = new IndexerContractService(
    contract,
    account,
    web3
  );

  const indexPricer = new IndexPricer(indexerContractService, ipfs);
  indexPricer.start();

  const scheduledIndexer = new ScheduledIndexer(indexerContractService, ipfs);
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

init().catch(e => {
  console.error("CRITICAL ERROR: ", e);
  process.exit(1);
});
// reset(networkType);
