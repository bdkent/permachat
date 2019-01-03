import _ from "lodash";

import BN from "bn.js";

const customSerializer = function(key, value) {
  const rawValue = this[key];
  if (BN.isBN(rawValue)) {
    return rawValue.toNumber();
  }
  return value;
};

class SaneIPFS {
  constructor(ipfs) {
    this.ipfs = ipfs;
  }

  async remove(path) {
    try {
      await this.ipfs.files.rm(path);
    } catch (e) {
      return false;
    }
    return true;
  }

  async writeString(path, contentString) {
    try {
      await this.ipfs.files.write(path, Buffer.from(contentString), {
        create: true,
        parents: true
      });
    } catch (e) {
      console.error("writeString", e);
      return false;
    }
    return true;
  }

  async writeJSON(path, contentJSON) {
    return await this.writeString(
      path,
      JSON.stringify(contentJSON, customSerializer)
    );
  }

  async exists(path) {
    try {
      await this.ipfs.files.ls(path);
    } catch (e) {
      return false;
    }
    return true;
  }

  async ls(path) {
    try {
      return await this.ipfs.files.ls(path);
    } catch (e) {
      return [];
    }
  }

  async readJSON(path) {
    try {
      const contentBuffer = await this.ipfs.files.read(path);
      return JSON.parse(contentBuffer.toString("utf8"));
    } catch (e) {
      // console.error("readJSON", e);
      return null;
    }
  }
}

export default SaneIPFS;
