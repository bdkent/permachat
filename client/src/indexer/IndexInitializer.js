import _ from "lodash";

import LogUtils from "../utils/LogUtils";
import ClassUtils from "../utils/ClassUtils";

LogUtils.setLowest(logger, "info");

class IndexInitializer {
  constructor(ipfs) {
    ClassUtils.bindAllMethods(IndexInitializer.prototype, this);
    this.ipfs = ipfs;
  }
  async bootstrapInitialize() {
    const self = this;
    try {
      await self.ipfs.files.mkdir("/root");
    } catch (e) {
      logger.error(e);
    }

    const stat = await self.ipfs.files.stat("/root");
    logger.debug("stat", stat);

    const firstDBHash = stat.hash;
    logger.debug("firstDB", firstDBHash);

    return await self.doInitialize(firstDBHash);
  }

  async nextInitialize(currentDBHash) {
    const self = this;
    const rootDir = "/root-" + currentDBHash;

    try {
      await self.ipfs.files.rm(rootDir, { recursive: true });
    } catch (e) {
      // console.error(e);
    }

    try {
      await self.ipfs.files.cp("/ipfs/" + currentDBHash, rootDir, {
        parents: true
      });
    } catch (e) {}

    return rootDir;
  }

  async doInitialize(currentDBHash) {
    const self = this;
    logger.debug("initialize", "|", currentDBHash, "|");

    if (_.isNil(currentDBHash)) {
      return await self.bootstrapInitialize();
    } else {
      return await self.nextInitialize(currentDBHash);
    }
  }

  async cleanup(currentDBHash, rootDir) {
    const self = this;
    logger.debug("cleanup", rootDir, currentDBHash);
    const ls = await self.ipfs.files.ls("/");

    await Promise.all(
      _.map(ls, async l => {
        const path = "/" + l.name;
        const stat = await self.ipfs.files.stat(path);
        if (path !== rootDir && stat.hash === currentDBHash) {
          logger.debug("cleaning", path, stat.hash);
          try {
            await self.ipfs.files.rm(path, { recursive: true });
          } catch (e) {
            return false;
          }
        }
        return true;
      })
    );

    return true;
  }

  async initialize(currentDBHash) {
    const self = this;
    try {
      await self.ipfs.files.ls("/");
    } catch (e) {
      logger.warn("verify IPFS is running", e);
    }

    logger.debug("initialize", currentDBHash);
    const rootDir = await self.doInitialize(currentDBHash);
    logger.debug("rootDir", rootDir);
    // await self.cleanup(currentDBHash, rootDir);

    return rootDir;
  }
}

export default IndexInitializer;
