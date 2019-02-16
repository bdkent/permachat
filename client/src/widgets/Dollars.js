import _ from "lodash";
import React from "react";
import {connect} from "react-redux";

function convertWeiToDollars(web3, etherPriceInCents, wei) {
  if (_.isNil(web3) || _.isNil(etherPriceInCents) || _.isNil(wei)) {
    return -1;
  } else {
    const weiBN = web3.utils.toBN(wei.toString());
    const ether = web3.utils.fromWei(weiBN.toString(), "ether");
    const dollars = (ether * etherPriceInCents) / 100;
    return dollars.toFixed(2);
  }
}

const Dollars = connect((state, ownProps) => {

  const {web3, etherPrice: {priceInCents}} = state;
  const {wei} = ownProps;

  console.log(web3, priceInCents, wei);

  return {
    dollars: convertWeiToDollars(web3, priceInCents, wei)
  };
})(props => <span>${_.toString(props.dollars)}</span>);

export default Dollars;