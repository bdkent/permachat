import React from "react";

import ExternalURIs from "../utils/ExternalURIs";
import ExternalAnchor from "./ExternalAnchor";

const EthereumContract = ({ address }) => {
  const uri = ExternalURIs.toEthereumSmartContractUri(address);
  return <ExternalAnchor href={uri}>{address}</ExternalAnchor>;
};

export default EthereumContract;
