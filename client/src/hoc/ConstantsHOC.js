import React from "react";

const ConstantsHOC = (WrappedComponent, constantProps) => {
  return props => (
    <WrappedComponent {...constantProps} {...props}>
      {props.children}
    </WrappedComponent>
  );
};

export default ConstantsHOC;
