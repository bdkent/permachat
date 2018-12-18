import TweeterContract from "./contracts/Tweeter.json";
import truffleContract from "truffle-contract";
import ipfs from "./utils/ipfs";
import Web3 from "web3";
// import { Buffer } from "buffer/";

import IPFS from "ipfs-http-client";

import { DAGLink } from "ipld-dag-pb";

async function init() {
  // Get network provider and web3 instance.
  const testNetWS = "ws://127.0.0.1:7545";

  const root = "/forever-talk/";

  const web3 = new Web3(new Web3.providers.WebsocketProvider(testNetWS));

  // Use web3 to get the user's accounts.
  const accounts = await web3.eth.getAccounts();

  console.log("READY");
  // const x = await ipfs.files.cat(
  //   "/ipfs/QmdckCoPuhEtiNzREtqpYn8dBgY8ifcG82Q4eyEdGCLEiu"
  // );
  // console.log("x", x.toString("utf8"));
  //
  // const y = await ipfs.files.ls("/");
  // console.log("y", y);

  const hello = await ipfs.add(Buffer.from("hello"));
  console.log("hello", hello);

  const world = await ipfs.add(Buffer.from("world"));
  console.log("world", world);

  const wow = await ipfs.object.patch.addLink(
    hello[0].hash,
    new DAGLink(world[0].hash, world[0].size, world[0].hash)
  );
  console.log("wow", wow);

  // Get the contract instance.
  const Contract = truffleContract(TweeterContract);
  Contract.setProvider(web3.currentProvider);
  const instance = await Contract.deployed();

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

        const dbRootResult = await ipfs.add(Buffer.from("hello"));
        console.log("dbRootResult", dbRootResult);

        const dbRootHash = dbRootResult[0].hash;
        console.log("dbRootHash", dbRootHash);

        const newTweetPath = "/ipfs/" + ipfsHash;
        const newDbIndexPath = "/ipfs/" + dbRootHash + path;

        const cp1Result = await ipfs.files.cp("/ipfs/" + dbRootHash, root, {
          parents: true
        });
        console.log("cp1Result", cp1Result);

        const cp2Result = await ipfs.files.cp(newTweetPath, path, {
          parents: true
        });
        console.log("cp2Result", cp2Result);

        const addResult = await ipfs.files.addFromFs(root, {
          recursive: true
        });
        console.log("addResult", addResult);

        /*
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
        */
      }
    }

    if (!error) {
      const { currentDB, tweeter, ipfsHash } = result.returnValues;
      console.log(currentDB, tweeter, ipfsHash);
      update(currentDB, tweeter, ipfsHash);
    }
  });
}

init();
