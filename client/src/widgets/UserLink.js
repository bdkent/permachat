import _ from "lodash";
import React from "react";

import { UncontrolledTooltip } from "reactstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faGithub } from "@fortawesome/free-brands-svg-icons";

import { Link } from "react-router-dom";

import ExternalAnchor from "../widgets/ExternalAnchor";
import SwitchHOC from "../hoc/SwitchHOC";

const TwitterProviderDetails = props => {
  return (
    <ExternalAnchor href={"https://twitter.com/" + props.userName}>
      <FontAwesomeIcon icon={faTwitter} /> @{props.userName}
    </ExternalAnchor>
  );
};

const GitHubProviderDetails = props => {
  return (
    <ExternalAnchor href={"https://github.com/" + props.userName}>
      <FontAwesomeIcon icon={faGithub} /> {props.userName}
    </ExternalAnchor>
  );
};

const ProviderDetails = SwitchHOC("provider", {
  twitter: TwitterProviderDetails,
  github: GitHubProviderDetails
});

const UserLink = ({ address, providers }) => {
  const snip = address.substring(0, 8);
  const id = "user-id-" + address;
  return (
    <span>
      <Link title={address} to={"/users/" + address}>
        <code id={id}>{snip}...</code>
      </Link>
      <UncontrolledTooltip placement="top" target={id}>
        {address}
      </UncontrolledTooltip>
      {_.map(providers, (p, i) => {
        return (
          <div key={i}>
            <ProviderDetails {...p} />
          </div>
        );
      })}
    </span>
  );
};

export default UserLink;
