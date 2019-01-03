import _ from "lodash";

import ipfs from "../utils/ipfs-local";
import LogUtils from "../utils/LogUtils";

LogUtils.setLowest(logger, "info");

const IndexInitializer = {
  bootstrapInitialize: async () => {
    try {
      await ipfs.files.mkdir("/root");
    } catch (e) {
      logger.error(e);
    }

    const stat = await ipfs.files.stat("/root");
    logger.debug("stat", stat);

    const firstDBHash = stat.hash;
    logger.debug("firstDB", firstDBHash);

    return await IndexInitializer.doInitialize(firstDBHash);
  },

  nextInitialize: async currentDBHash => {
    const rootDir = "/root-" + currentDBHash;

    try {
      await ipfs.files.rm(rootDir, { recursive: true });
    } catch (e) {
      // console.error(e);
    }

    try {
      await ipfs.files.cp("/ipfs/" + currentDBHash, rootDir, {
        parents: true
      });
    } catch (e) {}

    return rootDir;
  },

  doInitialize: async currentDBHash => {
    logger.debug("initialize", "|", currentDBHash, "|");

    if (_.isNil(currentDBHash)) {
      return await IndexInitializer.bootstrapInitialize();
    } else {
      return await IndexInitializer.nextInitialize(currentDBHash);
    }
  },

  cleanup: async (currentDBHash, rootDir) => {
    logger.debug("cleanup", rootDir, currentDBHash);
    const ls = await ipfs.files.ls("/");

    await Promise.all(
      _.map(ls, async l => {
        const path = "/" + l.name;
        const stat = await ipfs.files.stat(path);
        if (path !== rootDir && stat.hash === currentDBHash) {
          logger.debug("cleaning", path, stat.hash);
          try {
            await ipfs.files.rm(path, { recursive: true });
          } catch (e) {
            return false;
          }
        }
        return true;
      })
    );

    return true;
  },

  initialize: async currentDBHash => {
    try {
      await ipfs.files.ls("/");
    } catch (e) {
      logger.warn("verify IPFS is running", e);
    }

    logger.debug("initialize", currentDBHash);
    const rootDir = await IndexInitializer.doInitialize(currentDBHash);
    logger.debug("rootDir", rootDir);
    // await IndexInitializer.cleanup(currentDBHash, rootDir);

    return rootDir;
  }
};

export default IndexInitializer;
