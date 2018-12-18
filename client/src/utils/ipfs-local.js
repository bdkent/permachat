import IPFS from "ipfs-http-client";

const ipfs = new IPFS({
  host: "localhost",
  port: 5001,
  protocol: "http"
});

export default ipfs;
