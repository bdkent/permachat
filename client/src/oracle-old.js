import TweeterContract from "./contracts/Tweeter.json";
import truffleContract from "truffle-contract";
// import ipfs from "./utils/ipfs";
import Web3 from "web3";
//import IPFS from "ipfs";
import { DAGLink } from "ipld-dag-pb";

import ipfs from "./utils/ipfs-local";

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

  // const node = new IPFS();
  //
  // const ipfs = node.on("ready", async () => {
  // var cleanUpCount = 0;
  // function cleanUp() {
  //   console.info("STOPPING");
  //   if (cleanUpCount === 0) {
  //     ipfs.stop();
  //   }
  //   cleanUpCount++;
  // }

  console.log("READY");

  const id = await ipfs.id();
  console.log("id", id);

  // [
  //   "SIGTERM",
  //   "exit",
  //   "SIGINT",
  //   "SIGUSR1",
  //   "SIGUSR2",
  //   "uncaughtException"
  // ].forEach(event => {
  //   process.on(event, cleanUp);
  // });

  const markerDags = await ipfs.add(Buffer.from("-"));
  const markerDag = markerDags[0];

  const tweet1 = await ipfs.add(
    Buffer.from("world-" + String(Math.random() + Date.now()))
  );
  console.log("tweet1", tweet1[0]);

  const tweet1Hash = tweet1[0].hash;
  console.log("tweet1Hash", tweet1Hash);

  const tweet2 = await ipfs.add(Buffer.from("hello"));
  console.log("tweet2", tweet2[0]);

  const rootResult = await ipfs.add({
    path: root + "root",
    content: Buffer.from("hello")
  });
  console.log("rootResult", rootResult);
  const dbRootFolder = rootResult.find(x => x.path === rootFolder);
  console.log("dbRootFolder", dbRootFolder);

  console.log(1);
  try {
    await ipfs.files.rm(dbRootFolder.hash, { recursive: true });
  } catch (e) {
    console.error(e);
  }
  console.log(2);

  // try {
  //   await ipfs.files.mkdir(root, { recursive: true });
  // } catch (e) {
  //   console.error(e);
  // }
  console.log(2.5);
  try {
    await ipfs.files.cp("/ipfs/" + dbRootFolder.hash, "/", {
      parents: true
    });
  } catch (e) {
    console.error(e);
  }
  console.log(3);

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

  const pathPrefix = "/" + dbRootFolder.hash + "/" + pathSegment;
  console.log("pathPrefix", pathPrefix);

  const path = pathPrefix + "/" + timestamp;
  console.log("path", path);

  try {
    await ipfs.files.mkdir(path, { parents: true });
  } catch (e) {
    console.error(e);
  }
  console.log(4);

  await ipfs.files.cp("/ipfs/" + tweet1Hash, path + "/" + tweet1Hash, {
    parents: true
  });

  console.log(5);

  const stat = await ipfs.files.stat("/" + dbRootFolder.hash);
  console.log("stat", stat);
  const newDb = stat.hash;

  // const published = await ipfs.name.publish("/ipfs/" + newDb);
  // console.log("published", published);
  ///////////////

  // try {
  //   await ipfs.files.mkdir("/corn");
  // } catch (e) {}
  // try {
  //   await ipfs.files.write("/corn/cob", Buffer.from("-"), { create: true });
  // } catch (e) {}
  // const rrr = await ipfs.addFromFs("/corn", { recursive: true });
  // console.log("rrr", rrr);
  //
  // const now = new Date();
  // const year = now.getFullYear();
  // const month = now.getMonth();
  // const day = now.getDate();
  // const hour = now.getHours();
  //
  // const page = 0;
  //
  // const addToPath = async function(destHash, srcHash, path, name) {
  //   console.log("\n");
  //   console.log("addToPath", destHash, srcHash, path);
  //
  //   const srcDags = await ipfs.get(srcHash);
  //   console.log("srcDags", srcDags);
  //   const srcContent = srcDags[0].content.toString("utf8");
  //   console.log("srcContent", srcContent);
  //
  //   const newName = name || srcHash;
  //
  //   const pathedSrcDags = await ipfs.add({
  //     path: path + "/" + newName,
  //     content: srcDags[0].content
  //   });
  //   console.log("pathedSrcDags", pathedSrcDags);
  //   const pathedSrcRootDag = pathedSrcDags[pathedSrcDags.length - 1];
  //   console.log("pathedSrcRootDag", pathedSrcRootDag);
  //
  //   const newDestDag = await ipfs.object.patch.addLink(
  //     destHash,
  //     new DAGLink(
  //       pathedSrcRootDag.path,
  //       pathedSrcRootDag.size,
  //       pathedSrcRootDag.hash
  //     )
  //   );
  //   console.log("newDestDag", newDestDag.toBaseEncodedString(), newDestDag);
  //
  //   return newDestDag.toBaseEncodedString();
  // };
  //
  // const addEmptyPath = async function(destHash, path) {
  //   return addToPath(destHash, markerDag.hash, path, "marker");
  // };
  //
  // const addToDB = async function(dbHash, tweetHash) {
  //   console.log("\n");
  //   console.log("addToDB", dbHash, tweetHash);
  //
  //   const tweet1Get = await ipfs.get(tweetHash);
  //   console.log("tweetGet", tweet1Get);
  //   const tweet1Content = tweet1Get[0].content.toString("utf8");
  //   console.log("tweet1Content", tweet1Content);
  //
  //   const timestamp = new Date().getTime().toString();
  //
  //   const pathPrefix =
  //     root + [year, month, day, hour, page].map(x => x.toString()).join("/");
  //
  //   const path = pathPrefix + "/" + timestamp;
  //
  //   console.log("path", path);
  //
  //   const tweet1InPath = await ipfs.add({
  //     path: "/" + timestamp + "/" + tweetHash,
  //     content: tweet1Get[0].content
  //   });
  //   console.log("tweet1InPath", tweet1InPath);
  //   const tweet1InPathX = tweet1InPath[tweet1InPath.length - 1];
  //
  //   const dbGet = await ipfs.get("/ipfs/" + dbRootFolder.hash);
  //   console.log("dbGet", dbGet);
  //
  //   // const newDb = await ipfs.object.patch.addLink(
  //   //   dbRootFolder.hash,
  //   //   new DAGLink(tweet1InPathX.path, tweet1InPathX.size, tweet1InPathX.hash)
  //   // );
  //   // console.log("newDb", newDb);
  //   //
  //   // return newDb.toBaseEncodedString();
  //   return 1;
  // };

  // const dbHash1 = dbRootFolder.hash;
  //
  // const dbHash2 = await addToPath(
  //   dbHash1,
  //   markerDag.hash,
  //   "/hello/there",
  //   "marker"
  // );
  // console.log("dbHash2", dbHash2);
  //
  // const dbHash3 = await addEmptyPath(dbHash2, "/foo/bar/baz");
  // console.log("dbHash3", dbHash3);
  //
  // const dbHash4 = await addToPath(dbHash3, tweet1Hash, "/foo/bar/baz", "dude");
  // console.log("dbHash4", dbHash4);
  //
  // const x = await ipfs.object.get(dbHash4);
  // console.log("x", x);

  // const dbHash2 = await addToDB(dbRootFolder.hash, tweet1[0].hash);
  // console.log("dbHash2", dbHash2);

  // const dbHash3 = await addToDB(dbHash2, tweet2[0].hash);
  // console.log("dbHash3", dbHash3);

  /*
  const world = await ipfs.add({
    path: "/here/goodbye.txt",
    content: Buffer.from("world")
  });
  console.log("world", world);

  const wow = await ipfs.object.patch.addLink(
    hello[1].hash,
    new DAGLink("goodbye.txt", world[0].size, world[0].hash)
  );
  console.log("wow", wow.toBaseEncodedString()); //.multihash.toString("utf8"));
  const wowHash = wow.toBaseEncodedString();

  const ls = await ipfs.ls("/ipfs/" + wowHash);
  console.log("ls", ls);

  const stat = await ipfs.object.stat(wowHash);
  console.log("stat", stat);
*/

  console.log("START CONTRACT");
  // Get the contract instance.
  const Contract = truffleContract(TweeterContract);
  Contract.setProvider(web3.currentProvider);
  const instance = await Contract.deployed();

  const getNewDB = await instance.getNewDB();
  console.log("getNewDB", getNewDB);

  const setNewDB = await instance.setNewDB(newDb, { from: account });
  console.log("setNewDB", setNewDB);

  instance.NewTweetEvent((error, result) => {
    async function update(currentDB, tweeter, ipfsHash) {
      console.log("update", currentDB, tweeter, ipfsHash);
      if (currentDB) {
        console.log("???");
      } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();
        const hour = now.getHours();

        const page = 0;
        const timestamp = now.getTime();

        const path =
          root +
          [year, month, day, hour, page, timestamp]
            .map(x => x.toString())
            .join("/");

        console.log("path", path);

        const yyy = await ipfs.files.cat("/ipfs/" + ipfsHash);
        console.log("yyy", yyy.toString("utf8"));
        //
        // try {
        //   const ls = await ipfs.files.ls(path);
        //   console.log("ls", ls);
        // } catch (e) {
        //   console.error("ls", "error", e);
        // }

        try {
          const mkdir = await ipfs.files.mkdir(path, {
            parents: true
          });
          console.log("mkdir", mkdir);
        } catch (e) {
          console.error("mkdir", "error", e);
        }

        const cp = await ipfs.files.cp("/ipfs/" + ipfsHash, path, {
          parents: true
        });
        console.log("cp", cp);

        // await ipfs.files.mkdir(path, { parents: true });

        // console.log("made dir");

        const addResult = await ipfs.files.add(
          { path: root },
          { recursive: true }
        );
        const { newDB } = addResult[0];

        console.log("HERE", addResult, newDB);
      }
    }

    if (!error) {
      const { currentDB, tweeter, ipfsHash } = result.returnValues;
      console.log(currentDB, tweeter, ipfsHash);
      update(currentDB, tweeter, ipfsHash);
    }
  });
  // });
}

init();
