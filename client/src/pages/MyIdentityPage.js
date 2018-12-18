import _ from "lodash";
import React from "react";

import { Breadcrumb, BreadcrumbItem } from "reactstrap";

import LoadableHOC from "../hoc/LoadableHOC";
//import DerivedStateHOC from "../hoc/DerivedStateHOC";
import IfElseHOC from "../hoc/IfElseHOC";
import SwitchHOC from "../hoc/SwitchHOC";

import IdentityForm from "../widgets/IdentityForm";
import ExternalAnchor from "../widgets/ExternalAnchor";

const TwitterIdentityProvider = props => {
  return (
    <div>
      Twitter: @{props.userName}
      <ExternalAnchor href={props.evidenceUri}>Validating URI</ExternalAnchor>
    </div>
  );
};

const IdentityProvider = SwitchHOC("provider", {
  twitter: TwitterIdentityProvider
});

const IdentityProviders = LoadableHOC(
  props => {
    return (
      <div>
        {_.map(props.providers, identityProvider => {
          return (
            <div key={identityProvider.provider}>
              <IdentityProvider {...identityProvider} />
            </div>
          );
        })}
      </div>
    );
  },
  { providers: props => props.identityService.getMyIdentityProviders() }
);

const IdentityDetails = props => {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem>Identity</BreadcrumbItem>
        <BreadcrumbItem active>
          {_.toString(props.identityInfo.id)}
        </BreadcrumbItem>
      </Breadcrumb>
      DETAILS
      <IdentityProviders {...props} identityId={props.identityInfo.id} />
    </div>
  );
};

const IdentityContent = IfElseHOC(
  "identityInfo",
  IdentityDetails,
  IdentityForm
);

const MyIdentityPage = LoadableHOC(
  props => {
    return (
      <div>
        <IdentityContent {...props} />
      </div>
    );
  },
  {
    identityInfo: props => props.identityService.getMyIdentity()
  }
);

export default MyIdentityPage;
