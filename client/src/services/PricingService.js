import _ from "lodash";
import { fetch } from "whatwg-fetch";

import ClassUtils from "../utils/ClassUtils";

const LookupIntervalMs = 1000 * 60 * 5;

class PricingService {
  current: {};

  constructor(web3) {
    this.web3 = web3;

    ClassUtils.bindAllMethods(PricingService.prototype, this);

    this.lookup();
    window.setInterval(this.lookup, LookupIntervalMs);
  }

  async lookup() {
    // console.log("looking up ETH price");
    const result = await fetch(
      "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR"
    );
    const json = await result.json();

    const price = json.USD * 100;
    const now = new Date().getTime();

    // console.log("ETH price", price);

    this.current = {
      timestamp: now,
      priceInCents: price
    };
  }

  latest() {
    return _.assign({}, this.current);
  }

  convertCentsToEther(cents) {
    if (_.isNil(this.current)) {
      return 0;
    } else {
      return (1 / this.current.priceInCents) * cents;
    }
  }

  convertWeiToDollars(wei) {
    if (this.current) {
      const ether = this.web3.utils.fromWei(this.web3.utils.toBN(wei), "ether");
      // console.log("ether", ether.toString());
      const dollars = (ether * this.current.priceInCents) / 100;
      // console.log("dollars", dollars.toString());
      return dollars.toFixed(2);
    } else {
      return -1;
    }
  }
}

export default PricingService;
