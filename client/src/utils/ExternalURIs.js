const ExternalURIs = {
  IPFS_GATEWAY_DOMAIN: "ipfs.infura.io",

  toIpfsUriFromHash: hash => {
    return "https://" + ExternalURIs.IPFS_GATEWAY_DOMAIN + "/ipfs/" + hash;
  },

  toEthereumSmartContractUri: address => {
    return "http://127.0.0.1:7545/contract/" + address;
  }
};

export default ExternalURIs;
