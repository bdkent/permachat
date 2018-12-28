import _ from "lodash";

import PermaChatContract from "./contracts/PermaChat.json";
import truffleContract from "truffle-contract";
import Web3 from "web3";
import { DAGLink } from "ipld-dag-pb";

import "./logger-init.js";
import ipfs from "./utils/ipfs-local";

import IndexInitializer from "./indexer/IndexInitializer";
import PostIndexer from "./indexer/PostIndexer";
import ActionIndexer from "./indexer/ActionIndexer";
import Primer from "./indexer/Primer";
import IndexerContractService from "./indexer/IndexerContractService";
import IndexPersister from "./indexer/IndexPersister";

import Model from "./services/Model";

class Oracle {
  constructor(contract, ipfs, account) {
    this.contract = contract;
    this.ipfs = ipfs;
    this.account = account;
  }

  async updateDatabase(rootDir, currentDBIndex) {
    const stat = await this.ipfs.files.stat(rootDir);
    console.log("stat", stat);

    const newDbHash = stat.hash;
    console.log("newDbHash", newDbHash);

    const added = await this.ipfs.files.flush();
    console.log("added (flush)", added);

    await this.contract.setDatabaseIndex(currentDBIndex + 1, newDbHash, {
      from: this.account
    });
    console.log("DB UPDATED");

    return newDbHash;
  }

  async indexPost(rootDir, post) {
    // these are the broad domains the index falls under
    const indexDomains = ["all", "users/" + post.poster];

    const pathsPerPost = await Promise.all(
      _.map(indexDomains, domain =>
        PostIndexer.indexPost(rootDir, post, domain)
      )
    );

    return _.compact(_.flatten(pathsPerPost));
  }

  async handleNewPost(currentDBIndex, currentDBHash, post) {
    console.log("handleNewPost", currentDBHash, post);
    const rootDir = await IndexInitializer.initialize(currentDBHash);
    console.log("DONE INITIALIZE");

    const postPaths = await this.indexPost(rootDir, post);
    console.log("postPaths", postPaths);

    const newPaths = _.uniq(_.map(postPaths, p => p.replace(rootDir, "")));
    console.log("newPaths", newPaths);

    const newDbHash = await this.updateDatabase(rootDir, currentDBIndex);

    Primer.prime(newPaths, newDbHash);
  }
}

const config = async () => {
  // Get network provider and web3 instance.
  const testNetWS = "ws://127.0.0.1:7545";

  const web3 = new Web3(new Web3.providers.WebsocketProvider(testNetWS));

  // Use web3 to get the user's accounts.
  const accounts = await web3.eth.getAccounts();

  const account = accounts[0];

  console.log("READY");

  // Get the contract instance.
  const Contract = truffleContract(PermaChatContract);
  Contract.setProvider(web3.currentProvider);
  const contract = await Contract.deployed();

  return {
    web3,
    accounts,
    account,
    contract
  };
};

const testPost = async (oracle, contract, account) => {
  const tweet1 = await ipfs.add(
    Buffer.from("world-" + String(Math.random() + Date.now()))
  );
  console.log("tweet1", tweet1[0]);

  const latestDatabaseState = await contract.getLatestDatabaseState();
  console.log("latestDatabaseState", latestDatabaseState);

  const currentDBIndex = latestDatabaseState.latestDatabaseIndex;
  console.log("currentDBIndex", currentDBIndex);

  const currentDB = latestDatabaseState.ipfsHash;
  console.log("currentDB", currentDB);

  await oracle.handleNewPost(
    currentDBIndex,
    currentDB,
    new Model.Post(-1, tweet1[0].hash, account, -1, Date.now())
  );
};

const init = async () => {
  const { web3, accounts, account, contract } = await config();

  const indexerContractService = new IndexerContractService(contract, account);

  const indexPersister = new IndexPersister(indexerContractService);

  const actionIndexer = new ActionIndexer(
    indexerContractService,
    indexPersister
  );
  await actionIndexer.indexNextAction();
  console.log("DONE");

  // const oracle = new Oracle(contract, ipfs, account);
  //
  // await testPost(oracle, contract, account);
  //
  // contract.NewPostEvent((error, result) => {
  //   async function update(returnValues) {
  //     console.log("update", returnValues);
  //     const post = Model.Post.fromPermaChatContract(returnValues);
  //     await oracle.handleNewPost(returnValues.currentDatabaseIndex, post);
  //   }
  //
  //   if (!error) {
  //     update(result.returnValues);
  //   } else {
  //     console.error("NewPostEvent", error);
  //   }
  // });
};

const reset = async () => {
  const { web3, accounts, account, contract } = await config();

  const dir = "/empty-" + String(Math.random() + Date.now());
  await ipfs.files.mkdir(dir);
  const stat = await ipfs.files.stat(dir);
  const newDbHash = stat.hash;
  await contract.setDatabaseIndex(1, stat.hash, { from: account });

  console.log("db reset");
};

init();
// reset();
