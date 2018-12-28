import _ from "lodash";
import React from "react";

import { Breadcrumb, BreadcrumbItem } from "reactstrap";

import Datastore from "../widgets/Datastore";

const TagPage = props => {
  const { tag } = props;

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
        <BreadcrumbItem>Tags</BreadcrumbItem>
        <BreadcrumbItem active>{tag}</BreadcrumbItem>
      </Breadcrumb>

      <h2>Tag History</h2>
      <Datastore services={services} domain={"tags/all/" + tag} />
    </div>
  );
};

export default TagPage;
