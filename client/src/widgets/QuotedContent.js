import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuoteLeft, faQuoteRight } from "@fortawesome/free-solid-svg-icons";

const QuotedContent = ({ children }) => {
  return (
    <div>
      <FontAwesomeIcon
        className="text-muted mr-2"
        icon={faQuoteLeft}
        size="sm"
      />
      {children}
      <FontAwesomeIcon
        className="text-muted ml-2"
        icon={faQuoteRight}
        size="sm"
      />
    </div>
  );
};

export default QuotedContent;
