import React from "react";

const ExternalAnchor = props => {
  return (
    <a target="_blank" rel="noopener noreferrer" {...props}>
      {props.children}
    </a>
  );
};

export default ExternalAnchor;
