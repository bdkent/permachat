import _ from "lodash";

import BN from "bn.js";

import SaneIPFS from "../utils/SaneIPFS";
import ClassUtils from "../utils/ClassUtils";
import LogUtils from "../utils/LogUtils";

LogUtils.setLowest(logger, "info");

const DataPageSize = 1;

const toDateFromTimestamp = timestamp => {
  if (BN.isBN(timestamp)) {
    return new Date(timestamp.toNumber());
  } else if (_.isNumber(timestamp)) {
    return new Date(timestamp);
  } else {
    try {
      return new Date(parseInt(_.toString(timestamp)));
    } catch (e) {
      console.error("unexpected timestamp type: ", timestamp);
      throw e;
    }
  }
};

const DepthComponentCount = 6;
const DataFileName = "data.json";

const toDepthComponent = (date, depth) => {
  switch (depth) {
    case 0:
      return date.getFullYear();
    case 1:
      return date.getMonth();
    case 2:
      return date.getDate();
    case 3:
      return date.getHours();
    case 4:
      return date.getMinutes();
    case 5:
      return date.getSeconds();
    default:
      throw new Error("invalid depth component: " + depth);
  }
};

const toDepthsFromDate = date => {
  return _.range(DepthComponentCount).map(depth =>
    toDepthComponent(date, depth)
  );
};

const DataStatus = {
  FileExists: "file-exists",
  DirExists: "dir-exists",
  NotFound: "not-found"
};

class PostIndexer {
  constructor(ipfs) {
    ClassUtils.bindAllMethods(PostIndexer.prototype, this);
    this.saneIPFS = new SaneIPFS(ipfs);
  }

  async indexPost(rootDir, post, domain) {
    const self = this;
    logger.debug("indexPost", rootDir, post, domain);
    const now = toDateFromTimestamp(post.timestamp);

    const pathPrefix = rootDir + "/" + domain;
    logger.debug("pathPrefix", pathPrefix);

    const depths = toDepthsFromDate(now);

    const toDataFileDir = (depthSegments, depth) => {
      if (depth === 0) {
        return pathPrefix;
      } else {
        return pathPrefix + "/" + depthSegments.slice(0, depth).join("/");
      }
    };

    const toDataFilePath = (depthSegments, depth) => {
      return toDataFileDir(depthSegments, depth) + "/" + DataFileName;
    };

    // TODO: must test what if any folders already exist!
    const dataFilePingResults = await Promise.all(
      [...Array(depths.length + 1).keys()].map(async i => {
        const path = toDataFilePath(depths, i);
        logger.debug("path", path);
        const foundFile = await self.saneIPFS.exists(path);
        if (foundFile) {
          return DataStatus.FileExists;
        } else {
          // const dir = toDataFileDir(depths, i);
          // const foundDir = await self.saneIPFS.exists(dir);
          // if (foundDir) {
          //   return DataStatus.DirExists;
          // } else {
          return DataStatus.NotFound;
          // }
        }
      })
    );

    logger.debug("dataFilePingResults", dataFilePingResults);

    const dataFilePingIndex = _.findLastIndex(
      dataFilePingResults,
      x => x !== DataStatus.NotFound
    );
    logger.debug("dataFilePingIndex", dataFilePingIndex);

    const firstPost = async () => {
      logger.debug(1);
      const path = toDataFilePath(depths, 0);
      logger.debug("path", path);
      await self.saneIPFS.writeJSON(path, [post]);
      logger.debug(2);
      return path;
    };

    const nextPost = async depthIndex => {
      logger.debug("nextPost", depthIndex);
      const path = toDataFilePath(depths, dataFilePingIndex);
      logger.debug("path", path);
      const existingPosts = await self.saneIPFS.readJSON(path);
      const content = _.defaultTo(existingPosts, []).concat([post]);
      logger.debug("content", content);
      const dataFileStatus = dataFilePingResults[depthIndex];
      if (dataFileStatus === DataStatus.DirExists) {
        logger.debug("dir exists!  can this actually happen?");
      } else {
        if (content.length > DataPageSize) {
          const distributionDepth = _.range(
            depthIndex,
            DepthComponentCount
          ).find(depth => {
            // logger.debug("depth", depth);
            const groups = _.groupBy(content, post => {
              const date = toDateFromTimestamp(post.timestamp);
              return toDepthComponent(date, depth);
            });
            // logger.debug("groups", groups);
            return _.every(groups, (v, k) => {
              // logger.debug("every", k, v);
              return _.size(v) <= DataPageSize;
            });
          });

          logger.debug("distributionDepth", distributionDepth);

          const handleDistributions = async () => {
            if (distributionDepth === -1) {
              // we are at the bottom
              return [];
            } else {
              const distributionGroups = _.groupBy(content, post => {
                const date = toDateFromTimestamp(post.timestamp);
                return toDepthComponent(date, distributionDepth);
              });

              logger.debug("distributionGroups", distributionGroups);

              return await Promise.all(
                _.map(distributionGroups, async (posts, depth) => {
                  if (!_.isEmpty(posts)) {
                    logger.debug("disting", depth);
                    const date = toDateFromTimestamp(posts[0].timestamp);
                    const distDepths = toDepthsFromDate(date);
                    const distPath = toDataFilePath(
                      distDepths,
                      distributionDepth + 1
                    );
                    const sortedPosts = _.sortBy(posts, "timestamp");
                    logger.debug("dist write", distPath, sortedPosts);
                    await self.saneIPFS.writeJSON(distPath, sortedPosts);
                    return distPath;
                  } else {
                    return null;
                  }
                })
              );
            }
          };

          const distPaths = handleDistributions();

          await self.saneIPFS.remove(path);

          return distPaths;
        } else {
          await self.saneIPFS.writeJSON(path, content);
          return path;
        }
      }
    };

    if (dataFilePingIndex === -1) {
      return await firstPost();
    } else {
      return await nextPost(dataFilePingIndex);
    }
  }
}

export default PostIndexer;
