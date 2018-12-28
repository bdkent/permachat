import React from "react";

const ExternalAnchorHOC = WrappedComponent => {
  return props => {
    return (
      <WrappedComponent target="_blank" rel="noopener noreferrer" {...props}>
        {props.children}
      </WrappedComponent>
    );
  };
};

export default ExternalAnchorHOC;
