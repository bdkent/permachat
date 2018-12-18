import React from "react";

import MarkdownView from "./MarkdownView";
import ExternalAnchor from "./ExternalAnchor";
import ExternalURIs from "../utils/ExternalURIs";

const IpfsContentValue = ({ hash, content }) => {
  const uri = ExternalURIs.toIpfsUriFromHash(hash);
  if (content === null) {
    return <ExternalAnchor href={uri}>{hash}</ExternalAnchor>;
  } else {
    return <MarkdownView content={content} />;
  }
};

export default IpfsContentValue;
