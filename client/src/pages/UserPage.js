import _ from "lodash";
import React from "react";

import { Breadcrumb, BreadcrumbItem } from "reactstrap";

import Datastore from "../widgets/Datastore";

const UserPage = props => {
  // NOTE: right now userId is the ethereum address

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

      <h2>Details</h2>
      <dl>
        <dt>Ethereum Address</dt>
        <dd>{userId}</dd>
      </dl>

      <h2>Post History</h2>
      <Datastore services={services} domain={"users/" + userId} />
    </div>
  );
};

export default UserPage;
