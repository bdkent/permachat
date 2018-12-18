import _ from "lodash";
import { fetch } from "whatwg-fetch";

import ClassUtils from "../utils/ClassUtils";

class PricingService {
  current: {};

  constructor(web3) {
    this.web3 = web3;

    ClassUtils.bindAllMethods(PricingService.prototype, this);

    this.lookup();
    window.setInterval(this.lookup, 1000 * 30);
  }

  async lookup() {
    const result = await fetch(
      "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR"
    );
    const json = await result.json();

    const price = json.USD * 100;
    const now = new Date().getTime();

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
      const dollars = (ether * this.current.priceInCents) / 100;
      return dollars.toFixed(2);
    } else {
      return 0;
    }
  }
}

export default PricingService;
