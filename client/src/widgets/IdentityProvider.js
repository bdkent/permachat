// import _ from "lodash";
import React from "react";

import { Card, CardHeader, CardBody, CardImg } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTwitter, faGithub } from "@fortawesome/free-brands-svg-icons";

import LoadableHOC from "../hoc/LoadableHOC";
import SwitchHOC from "../hoc/SwitchHOC";

import ExternalAnchor from "../widgets/ExternalAnchor";
import Timestamp from "../widgets/Timestamp";

const BaseIdentityProvider = props => {
  return (
    <Card className="text-center">
      <CardHeader className="h4">
        <ExternalAnchor href={props.providerIdentityUri}>
          <FontAwesomeIcon className="mr-2" icon={props.icon} />
          {props.identityProvider.userName}
        </ExternalAnchor>
      </CardHeader>
      <CardImg src={props.iconUri} title="icon" className="" />
      <CardBody>
        <p>
          <ExternalAnchor href={props.evidenceUri}>evidence</ExternalAnchor>
        </p>
        <p className="mb-0">
          <span className="text-muted">
            validated{" "}
            <Timestamp
              timestamp={props.identityProvider.timestamp.toString()}
            />
          </span>
        </p>
      </CardBody>
    </Card>
  );
};

const TwitterIdentityProvider = LoadableHOC(BaseIdentityProvider, {
  icon: props => faTwitter,
  iconUri: async props =>
    "https://twitter.com/" +
    props.identityProvider.userName +
    "/profile_image?size=original",
  providerIdentityUri: props =>
    "https://twitter.com/" + props.identityProvider.userName,
  evidenceUri: props =>
    "https://twitter.com/" +
    props.identityProvider.userName +
    "/status/" +
    props.identityProvider.request.identifier
});

const GitHubIdentityProvider = LoadableHOC(BaseIdentityProvider, {
  icon: props => faGithub,
  iconUri: async props =>
    "https://avatars.githubusercontent.com/" + props.identityProvider.userName,
  providerIdentityUri: props =>
    "https://github.com/" + props.identityProvider.userName,
  evidenceUri: props =>
    "https://gist.github.com/" +
    props.identityProvider.userName +
    "/" +
    props.identityProvider.request.identifier
});

const IdentityProvider = SwitchHOC("provider", {
  twitter: TwitterIdentityProvider,
  github: GitHubIdentityProvider
});

export default IdentityProvider;
