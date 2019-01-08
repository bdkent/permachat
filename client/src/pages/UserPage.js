import _ from "lodash";
import React from "react";

import { Breadcrumb, BreadcrumbItem } from "reactstrap";
import { Row, Col } from "reactstrap";

import LoadableHOC from "../hoc/LoadableHOC";

import Datastore from "../widgets/Datastore";
import IdentityProvider from "../widgets/IdentityProvider";

const UserDetails = LoadableHOC(
  props => {
    const { userId, providers } = props;
    return (
      <React.Fragment>
        <h2>Identities</h2>
        <Row className="mb-4">
          {_.map(providers, (identityProvider, i) => {
            return (
              <Col key={i} md={4}>
                <IdentityProvider
                  identityProvider={identityProvider}
                  provider={identityProvider.provider}
                />
              </Col>
            );
          })}
        </Row>
        <h2 />
        <dl>
          <dt>Ethereum Address</dt>
          <dd>{userId}</dd>
        </dl>
      </React.Fragment>
    );
  },
  {
    providers: async props => {
      return await props.identityService.getIdentityProviders(props.userId);
    }
  }
);

const UserPage = props => {
  const { userId } = props;

  const services = _.assign(
    {},
    props.postService,
    props.pricingService,
    props.dataService,
    props.identityService
  );

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem>Users</BreadcrumbItem>
        <BreadcrumbItem active>{userId}</BreadcrumbItem>
      </Breadcrumb>
      <UserDetails userId={userId} identityService={props.identityService} />
      <h2>Post History</h2>
      <Datastore services={services} domain={"users/" + userId} />
    </div>
  );
};

export default UserPage;
