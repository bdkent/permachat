import _ from "lodash";

import BN from "bn.js";

import Model from "../services/Model";
import PostIndexer from "./PostIndexer";

import LogUtils from "../utils/LogUtils";

LogUtils.setLowest(logger, "info");

const ActionType = Model.ActionType;

class ActionIndexer {
  constructor(indexerContractService, indexPersister) {
    this.service = indexerContractService;
    this.indexPersister = indexPersister;
  }

  async indexNextAction() {
    const state = await this.service.getLatestDatabaseState();
    logger.debug(
      "state",
      _.toString(state.latestIndex),
      _.toString(state.paidIndex),
      _.toString(state.ipfsHash)
    );

    const latestDatabaseIndex = state.latestIndex;
    const paidDatabaseIndex = state.paidIndex;
    const currentHash = state.ipfsHash;

    logger.debug("latestDatabaseIndex", _.toString(latestDatabaseIndex));

    logger.debug("paidDatabaseIndex", _.toString(paidDatabaseIndex));

    if (latestDatabaseIndex.lt(paidDatabaseIndex)) {
      const nextDatabaseIndex = latestDatabaseIndex.addn(1);
      logger.debug("nextDatabaseIndex", _.toString(nextDatabaseIndex));
      const action = await this.service.getAction(nextDatabaseIndex);
      logger.debug("action", action);
      const { targetId, targetType } = action;

      return await this.indexPersister.persistWith(
        currentHash,
        nextDatabaseIndex,
        async rootDir => {
          switch (targetType.toNumber()) {
            case ActionType.POST:
            case ActionType.REPLY:
              return await this.indexNextPost(rootDir, targetId);
            case ActionType.COMMENT:
              logger.info("TODO: index comments");
              return [];
            default:
              logger.error("unknown target type", _.toString(targetType));
              return [];
          }
        }
      );
    } else {
      logger.info("all paid actions have been indexed already");
    }
  }

  async indexNextPost(rootDir, postId) {
    logger.debug("indexNextPost", rootDir, postId);
    const self = this;
    const post = await this.service.getPost(postId);

    const indexDomains = ["all", "users/" + post.poster];

    const pathsPerPost = await Promise.all(
      _.map(indexDomains, domain =>
        PostIndexer.indexPost(rootDir, post, domain)
      )
    );

    const paths = _.compact(_.flatten(pathsPerPost));
    logger.debug("paths", paths);

    return paths;
  }
}

export default ActionIndexer;
