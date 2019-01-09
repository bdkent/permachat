const path = require("path");
const HDWalletProvider = require("truffle-hdwallet-provider");

require("dotenv").config();

//

/*
https://medium.com/coinmonks/deploy-your-smart-contract-directly-from-truffle-with-infura-ba1e1f1d40c2
*/

/*
ganache-cli -p 7545 -m stumble scissors finger melt market master spray intact audit notable excuse elephant 
*/

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // matching any id
    },
    ropsten: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          "https://ropsten.infura.io/v3/" + process.env.INFURA_API_KEY
        ),
      network_id: 3,
      gas: 4500000
    },
    kovan: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          "https://kovan.infura.io/v3/" + process.env.INFURA_API_KEY
        ),
      network_id: 42,
      gas: 5000000
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          "https://rinkeby.infura.io/v3/" + process.env.INFURA_API_KEY
        ),
      network_id: 4,
      gas: 5000000
    }
  }
};
