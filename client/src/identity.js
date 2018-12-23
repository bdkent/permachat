import PermaChatContract from "./contracts/PermaChat.json";
import truffleContract from "truffle-contract";

import Minimist from "minimist";
import Web3 from "web3";

import dotenv from "dotenv";

dotenv.config();
/*
geth --rinkeby --rpc --rpcapi db,eth,net,web3,personal --rpcport 8545 --rpccorsdomain "*" --ws -wsapi db,eth,net,web3,personal --wsorigins="*" --syncmode=light console  



npm run identity --  --network rinkeby
*/

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
        provider: new Web3.providers.WebsocketProvider("ws://127.0.0.1:8546"),
        networkAccount: process.env.PERMACHAT_ACCOUNT
      };
    default:
      throw new Error("unknown network: " + networkType);
  }
};

const config = async networkType => {
  // Get network provider and web3 instance.

  const { provider, networkAccount } = newNetworkConfig(networkType);

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

  // console.log("defaultAccount", web3.eth.defaultAccount);
  //
  // const added = await web3.eth.accounts.wallet.add(
  //   process.env.PERMACHAT_PRIVATE_KEY
  // );
  // console.log("added", added);
  //
  // web3.eth.defaultAccount = process.env.PERMACHAT_ACCOUNT;
  //
  // console.log("defaultAccount", web3.eth.defaultAccount);

  await web3.eth.personal.unlockAccount(
    process.env.PERMACHAT_ACCOUNT,
    process.env.PERMACHAT_PASSWORD,
    600
  );

  console.log("UNLOCKED");

  // Get the contract instance.
  const Contract = truffleContract(PermaChatContract);
  Contract.setProvider(web3.currentProvider);
  const contract = await Contract.deployed();
  //
  console.log("CONTRACT");

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

  console.log("CONFIG DONE");

  const txParams = {
    from: account,
    gas: web3.utils.toHex("400000"),
    gasLimit: web3.utils.toHex("21000")
  };

  contract.NewRequestEvent(async (error, result) => {
    if (error) {
      console.error("error", "NewRequestEvent", error);
    } else {
      const { evidenceHash } = result.returnValues;

      console.log("evidenceHash", evidenceHash, typeof evidenceHash);

      try {
        await contract.approve(evidenceHash, "twitter", "bkent314", txParams);
        console.log("success");
      } catch (e) {
        console.error("error", "NewRequestEvent", "approve", e);
      }
    }
  });

  console.log("LISTENING");

  try {
    console.log("try", "setRequestPrice");
    await contract.setRequestPrice(web3.utils.toWei("10", "finney"), txParams);
  } catch (e) {
    console.error("error", "setRequestPrice", e);
  }

  console.log("DONE");
};

console.log("argv", process.argv);

const args = Minimist(process.argv);
console.log("args", args);

const networkType = args.network || "private";
console.log("network type", networkType);

init(networkType);
