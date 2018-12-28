import _ from "lodash";

import https from "https";
import fetch from "node-fetch";

import ClassUtils from "../utils/ClassUtils";

import LogUtils from "../utils/LogUtils";

// LogUtils.setLowest(logger, "info");

const GasPriceURI = "https://ethgasstation.info/json/ethgasAPI.json";

const DefaultIntervalMinutes = 15; // how about 30 mins ?
const IntervalMs = 1000 * 60 * DefaultIntervalMinutes;

class IndexPricer {
  constructor(indexerContractService) {
    ClassUtils.bindAllMethods(IndexPricer.prototype, this);
    this.indexerContractService = indexerContractService;
  }

  async getAveragePrice() {
    logger.debug("attempting to get latest average price");
    try {
      const response = await fetch(GasPriceURI);
      const json = await response.json();
      const average = json.average;
      if (_.isNil(average)) {
        logger.error("could not get average price");
      } else {
        logger.debug("latest average price", average);
      }
      return json.average;
    } catch (e) {
      logger.error("unable to poll average price");
      throw e;
    }
  }

  async update() {
    logger.debug("updating average price");
    const newPrice = await this.getAveragePrice();
    return this.indexerContractService.setUnlockPrice(newPrice);
  }

  async start() {
    await this.update();
    this.intervalId = setInterval(this.update, IntervalMs);
  }
}

export default IndexPricer;
