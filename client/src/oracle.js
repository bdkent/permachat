import _ from "lodash";

import PermaChatContract from "./contracts/PermaChat.json";
import truffleContract from "truffle-contract";
// import ipfs from "./utils/ipfs";
import Web3 from "web3";
//import IPFS from "ipfs";
import { DAGLink } from "ipld-dag-pb";

import ipfs from "./utils/ipfs-local";
import SaneIPFS from "./utils/SaneIPFS";
import https from "https";

import IndexInitializer from "./indexer/IndexInitializer";
import PostIndexer from "./indexer/PostIndexer";

import Model from "./services/Model";

const saneIPFS = new SaneIPFS(ipfs);

const indexInitializer = new IndexInitializer(ipfs);
const postIndexer = new PostIndexer(ipfs);

class Oracle {
  constructor(contract, ipfs, account) {
    this.contract = contract;
    this.ipfs = ipfs;
    this.account = account;
  }

  async handleNewPost(currentDBHash, post) {
    console.log("handleNewPost", currentDBHash, post);
    const rootDir = await indexInitializer.initialize(currentDBHash);
    console.log("DONE INITIALIZE");

    const v1 = await postIndexer.indexPost(rootDir, post, "all");
    console.log("v1", v1);
    const v2 = await postIndexer.indexPost(
      rootDir,
      post,
      "users/" + post.poster
    );
    console.log("v2", v2);

    const newPaths = _.uniq(
      _.map(_.compact(_.concat(v1, v2)), p => p.replace(rootDir, ""))
    );
    console.log("newPaths", newPaths);

    const stat = await ipfs.files.stat(rootDir);
    console.log("stat", stat);

    const newDbHash = stat.hash;
    console.log("newDbHash", newDbHash);

    const added = await ipfs.files.flush();
    console.log("added", added);

    await this.contract.setNewDB(newDbHash, { from: this.account });
    console.log("DB UPDATED");

    const allNewPathsFullDepth = _.map(
      _.uniq(
        _.flatten(
          _.map(newPaths, path => {
            const tokens = _.compact(_.split(path, "/"));
            return _.map(_.range(_.size(tokens)), i =>
              _.join(_.slice(tokens, 0, i + 1), "/")
            );
          })
        )
      ),
      p => "/" + newDbHash + "/" + p
    );

    console.log("allNewPathsFullDepth", allNewPathsFullDepth);

    setTimeout(async () => {
      console.log("PRIMING");

      const primeNextHash = (hashes, current, totalHashes) => {
        if (_.isEmpty(hashes)) {
          console.log("DONE");
          return;
        } else {
          const hash = hashes.shift();
          const progress = current + "/" + totalHashes;
          const url = "https://gateway.ipfs.io/ipfs" + hash;
          console.log(progress, "attempting GET of ", url);
          return https.get(url, resp => {
            console.log(progress, "successful priming of ", url);
            return primeNextHash(hashes, current + 1, totalHashes);
          });
        }
      };

      const hashes = ["/" + newDbHash].concat(allNewPathsFullDepth);
      return primeNextHash(hashes, 1, _.size(hashes));
    });
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

const init = async () => {
  const { web3, accounts, account, contract } = await config();

  const tweet1 = await ipfs.add(
    Buffer.from("world-" + String(Math.random() + Date.now()))
  );
  console.log("tweet1", tweet1[0]);

  const oracle = new Oracle(contract, ipfs, account);

  const currentDB = await contract.getLatestDBHash();

  await oracle.handleNewPost(
    currentDB,
    new Model.Post(-1, tweet1[0].hash, account, -1, Date.now())
  );

  contract.NewPostEvent((error, result) => {
    async function update(returnValues) {
      console.log("update", returnValues);
      const post = Model.Post.fromPermaChatContract(returnValues);
      await oracle.handleNewPost(returnValues.currentDatabaseIndex, post);
    }

    if (!error) {
      update(result.returnValues);
    } else {
      console.error("NewPostEvent", error);
    }
  });
};

const reset = async () => {
  const { web3, accounts, account, contract } = await config();

  const dir = "/empty-" + String(Math.random() + Date.now());
  await ipfs.files.mkdir(dir);
  const stat = await ipfs.files.stat(dir);
  const newDbHash = stat.hash;
  await contract.setNewDB(stat.hash, { from: account });

  console.log("db reset");
};

init();
// reset();
