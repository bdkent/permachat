import _ from "lodash";

import https from "https";

import LogUtils from "../utils/LogUtils";

LogUtils.setLowest(logger, "info");

const Queue = [];
var TimeoutId = null;
const TimeoutMs = 1000;

const primeNextHash = hash => {
  const url = "https://gateway.ipfs.io/ipfs" + hash;
  logger.info("attempting GET of ", url);
  return new Promise((resolve, reject) => {
    https
      .get(url, response => {
        logger.info("successful priming of", url);
        return resolve(response);
      })
      .on("error", reject);
  });
};

const toHashes = (newPaths, newDbHash) => {
  const fullPaths = _.map(
    _.uniq(
      _.flatten(
        _.map(newPaths, path => {
          const tokens = _.compact(_.split(path, "/"));
          return _.map(_.range(_.size(tokens)), i =>
            _.join(_.slice(tokens, 0, i + 1), "/")
          );
        })
      )
    ),
    p => "/" + newDbHash + "/" + p
  );

  logger.debug("fullPaths", fullPaths);

  return ["/" + newDbHash].concat(fullPaths);
};

const scheduleNextPrime = () => {
  if (_.isEmpty(Queue)) {
    logger.debug("priming queue empty");
    TimeoutId = null;
  } else {
    TimeoutId = setTimeout(() => {
      const size = _.size(Queue);
      logger.info("prime queue size =", size);
      const nextHash = Queue.shift();
      primeNextHash(nextHash).then(scheduleNextPrime);
    }, TimeoutMs);
  }
};

const Primer = {
  prime: async (newPaths, newDbHash) => {
    const hashes = toHashes(newPaths, newDbHash);
    _.forEach(hashes, hash => Queue.push(hash));
    if (_.isNil(TimeoutId)) {
      scheduleNextPrime();
    }
  }
};

export default Primer;
