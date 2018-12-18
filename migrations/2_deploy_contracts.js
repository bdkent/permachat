var PermaChat = artifacts.require("./PermaChat.sol");

module.exports = function(deployer) {
  deployer.deploy(PermaChat);
};
