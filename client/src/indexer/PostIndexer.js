import _ from "lodash";

import SaneIPFS from "../utils/SaneIPFS";

const DataPageSize = 1;

class PostIndexer {
  constructor(ipfs) {
    this.saneIPFS = new SaneIPFS(ipfs);
  }

  async indexPost(rootDir, post, domain) {
    const DepthComponentCount = 6;

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

    const now = new Date(post.timestamp);

    const pathPrefix = rootDir + "/" + domain;
    console.log("pathPrefix", pathPrefix);

    const toDepthsFromDate = date => {
      return _.range(DepthComponentCount).map(depth =>
        toDepthComponent(date, depth)
      );
    };

    const depths = toDepthsFromDate(now);

    const DataFileName = "data.json";
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

    const DataStatus = {
      FileExists: "file-exists",
      DirExists: "dir-exists",
      NotFound: "not-found"
    };

    // TODO: must test what if any folders already exist!
    const dataFilePingResults = await Promise.all(
      [...Array(depths.length + 1).keys()].map(async i => {
        const path = toDataFilePath(depths, i);
        console.log("path", path);
        const foundFile = await this.saneIPFS.exists(path);
        if (foundFile) {
          return DataStatus.FileExists;
        } else {
          // const dir = toDataFileDir(depths, i);
          // const foundDir = await this.saneIPFS.exists(dir);
          // if (foundDir) {
          //   return DataStatus.DirExists;
          // } else {
          return DataStatus.NotFound;
          // }
        }
      })
    );

    console.log("dataFilePingResults", dataFilePingResults);

    const dataFilePingIndex = _.findLastIndex(
      dataFilePingResults,
      x => x !== DataStatus.NotFound
    );
    console.log("dataFilePingIndex", dataFilePingIndex);

    const firstPost = async () => {
      console.log(1);
      const path = toDataFilePath(depths, 0);
      console.log("path", path);
      await this.saneIPFS.writeJSON(path, [post]);
      console.log(2);
    };

    const nextPost = async depthIndex => {
      console.log("nextPost", depthIndex);
      const path = toDataFilePath(depths, dataFilePingIndex);
      console.log("path", path);
      const existingPosts = await this.saneIPFS.readJSON(path);
      const content = _.defaultTo(existingPosts, []).concat([post]);
      console.log("content", content);
      const dataFileStatus = dataFilePingResults[depthIndex];
      if (dataFileStatus === DataStatus.DirExists) {
        console.log("dir exists!  can this actually happen?");
      } else {
        if (content.length > DataPageSize) {
          const distributionDepth = _.range(
            depthIndex,
            DepthComponentCount
          ).find(depth => {
            // console.log("depth", depth);
            const groups = _.groupBy(content, post => {
              const date = new Date(post.timestamp);
              return toDepthComponent(date, depth);
            });
            // console.log("groups", groups);
            return _.every(groups, (v, k) => {
              // console.log("every", k, v);
              return _.size(v) <= DataPageSize;
            });
          });

          console.log("distributionDepth", distributionDepth);

          const handleDistributions = async () => {
            if (distributionDepth === -1) {
              // we are at the bottom
              return [];
            } else {
              const distributionGroups = _.groupBy(content, post => {
                const date = new Date(post.timestamp);
                return toDepthComponent(date, distributionDepth);
              });

              console.log("distributionGroups", distributionGroups);

              return await Promise.all(
                _.map(distributionGroups, async (posts, depth) => {
                  if (!_.isEmpty(posts)) {
                    console.log("disting", depth);
                    const date = new Date(posts[0].timestamp);
                    const distDepths = toDepthsFromDate(date);
                    const distPath = toDataFilePath(
                      distDepths,
                      distributionDepth + 1
                    );
                    const sortedPosts = _.sortBy(posts, "timestamp");
                    console.log("dist write", distPath, sortedPosts);
                    await this.saneIPFS.writeJSON(distPath, sortedPosts);
                    return distPath;
                  } else {
                    return null;
                  }
                })
              );
            }
          };

          const distPaths = handleDistributions();

          await this.saneIPFS.remove(path);

          return distPaths;
        } else {
          await this.saneIPFS.writeJSON(path, content);
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
