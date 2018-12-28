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
  async persistWith(currentHash, currentIndex, f) {
    const rootDir = await IndexInitializer.initialize(currentHash);
    const mfsPaths = await f(rootDir);
    const newHash = await this.updateDatabase(rootDir, currentIndex);
    const paths = _.map(mfsPaths, p => p.replace(rootDir, ""));
    return await Primer.prime(paths, newHash);
  }

  async updateDatabase(rootDir, currentDatabaseIndex) {
    const stat = await ipfs.files.stat(rootDir);
    logger.debug("stat", stat);

    const newDbHash = stat.hash;
    logger.debug("newDbHash", newDbHash);

    const added = await ipfs.files.flush();
    logger.debug("added (flush)", added);

    // await indexerContractService.setDatabaseIndex(
    //   currentDBIndex + 1,
    //   newDbHash
    // );
    logger.debug("DB UPDATED");

    return newDbHash;
  }
}

export default IndexPersister;
