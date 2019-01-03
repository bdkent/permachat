import _ from "lodash";

import ipfs from "../utils/ipfs-local";

import IndexInitializer from "./IndexInitializer";
import Primer from "./Primer";

import LogUtils from "../utils/LogUtils";

LogUtils.setLowest(logger, "info");

class IndexPersister {
  constructor(indexerContractService) {
    this.indexerContractService = indexerContractService;
  }

  async persistWith(currentHash, nextDatabaseIndex, f) {
    logger.debug("persistWith", currentHash, nextDatabaseIndex);
    const rootDir = await IndexInitializer.initialize(currentHash);
    logger.debug("initialization complete");
    const mfsPaths = await f(rootDir);
    const newHash = await this.updateDatabase(rootDir, nextDatabaseIndex);
    const paths = _.map(mfsPaths, p => p.replace(rootDir, ""));
    return await Primer.prime(paths, newHash);
  }

  async updateDatabase(rootDir, nextDatabaseIndex) {
    logger.debug("updateDatabase", rootDir, _.toString(nextDatabaseIndex));
    const stat = await ipfs.files.stat(rootDir);
    logger.debug("stat", stat);

    const newDbHash = stat.hash;
    logger.debug("newDbHash", newDbHash);

    const added = await ipfs.files.flush();
    logger.debug("added (flush)", added);

    await this.indexerContractService.setDatabaseIndex(
      nextDatabaseIndex,
      newDbHash
    );
    logger.debug("DB UPDATED");

    return newDbHash;
  }
}

export default IndexPersister;
