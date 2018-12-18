import PermaChatContract from "./contracts/PermaChat.json";
import truffleContract from "truffle-contract";
// import ipfs from "./utils/ipfs";
import Web3 from "web3";
//import IPFS from "ipfs";
import { DAGLink } from "ipld-dag-pb";

import ipfs from "./utils/ipfs-local";
import https from "https";

class Oracle {
  constructor(contract, ipfs, account) {
    this.contract = contract;
    this.ipfs = ipfs;
    this.account = account;
  }

  async initialize(currentDBHash) {
    console.log("initialize", currentDBHash);
    const ipfs = this.ipfs;
    if (currentDBHash) {
      try {
        await ipfs.files.rm("/" + currentDBHash, { recursive: true });
      } catch (e) {
        // console.error(e);
      }

      try {
        await ipfs.files.cp("/ipfs/" + currentDBHash, "/", {
          parents: true
        });
      } catch (e) {}

      return currentDBHash;
    } else {
      try {
        await ipfs.files.mkdir("/root");
      } catch (e) {}

      const stat = await ipfs.files.stat("/root");
      console.log("stat", stat);

      const firstDBHash = stat.hash;
      console.log("firstDB", firstDBHash);

      return initialize(firstDBHash);
    }
  }

  async handleNewPost(currentDBHash, tweetHash) {
    this.initialize(currentDBHash);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const hour = now.getHours();
    const page = 0;
    const timestamp = new Date().getTime().toString();

    const pathSegment = [year, month, day, hour, page]
      .map(x => x.toString())
      .join("/");
    console.log("pathSegment", pathSegment);

    const pathPrefix = "/" + currentDBHash + "/" + pathSegment;
    console.log("pathPrefix", pathPrefix);

    const path = pathPrefix + "/" + timestamp;
    console.log("path", path);

    try {
      await ipfs.files.mkdir(path, { parents: true });
    } catch (e) {
      console.error(e);
    }
    console.log(4);

    await ipfs.files.cp("/ipfs/" + tweetHash, path + "/" + tweetHash, {
      parents: true
    });

    console.log(5);

    const stat = await ipfs.files.stat("/" + currentDBHash);
    console.log("stat", stat);

    const newDbHash = stat.hash;
    console.log("newDbHash", newDbHash);

    const added = await ipfs.files.flush();

    await this.contract.setNewDB(newDbHash, { from: this.account });

    setTimeout(async () => {
      const hashes = [newDbHash, newDbHash + "/" + path];
      hashes.forEach(hash => {
        const url = "https://gateway.ipfs.io/ipfs/" + hashes;
        https.get(url, resp => {
          console.log("priming fetch", url);
        });
      });
    });
  }
}

async function init() {
  // Get network provider and web3 instance.
  const testNetWS = "ws://127.0.0.1:7545";

  const rootFolder = "forever-talk";

  const root = "/" + rootFolder + "/";

  const web3 = new Web3(new Web3.providers.WebsocketProvider(testNetWS));

  // Use web3 to get the user's accounts.
  const accounts = await web3.eth.getAccounts();
  console.log("accounts", accounts);
  const account = accounts[0];

  console.log("READY");

  const tweet1 = await ipfs.add(
    Buffer.from("world-" + String(Math.random() + Date.now()))
  );
  console.log("tweet1", tweet1[0]);

  console.log("START CONTRACT");
  // Get the contract instance.
  const Contract = truffleContract(PermaChatContract);
  Contract.setProvider(web3.currentProvider);
  const contract = await Contract.deployed();

  const oracle = new Oracle(contract, ipfs, account);

  const currentDB = await contract.getLatestDBHash();

  await oracle.handleNewPost(currentDB, tweet1[0].hash);

  // const setNewDB = await contract.setNewDB(newDb, { from: account });
  // console.log("setNewDB", setNewDB);

  contract.NewPostEvent((error, result) => {
    async function update(currentDB, tweeter, ipfsHash) {
      console.log("update", currentDB, tweeter, ipfsHash);
      await oracle.handleNewPost(currentDB, ipfsHash);
    }

    if (!error) {
      const { currentDatabaseIndex, poster, ipfsHash } = result.returnValues;
      console.log(currentDatabaseIndex, poster, ipfsHash);
      update(currentDatabaseIndex, poster, ipfsHash);
    }
  });
  // });
}

init();
