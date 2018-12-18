import _ from "lodash";

import React from "react";
import ReactMarkdown from "react-markdown";

const linkifyHashTags = content => {
  const hashes = content
    .split(/\s+/)
    .filter(t => t !== "#" && _.startsWith(t, "#"));
  return _.reduce(
    hashes,
    (acc, hash) => {
      const tag = hash.replace("#", "");
      return _.replace(acc, hash, "[" + hash + "](/#/tags/" + tag + ")");
    },
    content
  );
};

// TODO: custom renderer so we don't need these classes

const MarkdownView = ({ content }) => {
  const linkified = linkifyHashTags(content);
  return (
    <ReactMarkdown
      source={linkified}
      className="ipfs-content-value ipfs-content-value-inline"
    />
  );
};

export default MarkdownView;
