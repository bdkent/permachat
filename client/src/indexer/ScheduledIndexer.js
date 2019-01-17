import _ from "lodash";

import ClassUtils from "../utils/ClassUtils";

import ActionIndexer from "./ActionIndexer";
import IndexerContractService from "./IndexerContractService";
import IndexPersister from "./IndexPersister";

import LogUtils from "../utils/LogUtils";

LogUtils.setLowest(logger, "info");

const DefaultIntervalMinutes = 1; // how about 30 mins ?
const IntervalMs = 1000 * 60 * DefaultIntervalMinutes;

class ScheduledIndexer {
  constructor(indexerContractService, ipfs) {
    ClassUtils.bindAllMethods(ScheduledIndexer.prototype, this);

    this.ipfs = ipfs;

    const indexPersister = new IndexPersister(indexerContractService, ipfs);

    this.intervalId = null;
    this.indexing = null;

    this.actionIndexer = new ActionIndexer(
      indexerContractService,
      indexPersister,
      ipfs
    );
  }

  start() {
    this.ipfs.files
      .ls("/")
      .catch(e =>
        logger.warn("!!! ALERT: verify IPFS is actually running !!!")
      );

    this.intervalId = setInterval(this.index, IntervalMs);
  }

  nextIndex() {
    const self = this;
    logger.info("attempting to index next action");
    self.indexing = self.actionIndexer
      .indexNextAction()
      .then(x => {
        self.indexing = null;
        return x;
      })
      .catch(e => {
        logger.error(e);
        throw e;
      });
    return self.indexing;
  }

  index() {
    const self = this;
    if (_.isNil(self.indexing)) {
      return self.nextIndex();
    } else {
      return self.indexing;
    }
  }
}

export default ScheduledIndexer;
