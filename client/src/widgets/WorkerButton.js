// import _ from "lodash";
import React from "react";

import { Button } from "reactstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSyncAlt } from "@fortawesome/free-solid-svg-icons";

import WorkerHOC from "../hoc/WorkerHOC";

import Noop from "./Noop";

const WorkerButton = WorkerHOC(
  "onClick",
  Button,
  props => <FontAwesomeIcon icon={faSyncAlt} spin className="mr-2" />,
  Noop
);

export default WorkerButton;
