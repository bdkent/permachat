import _ from "lodash";

import React, { Component } from "react";

import Datastore from "./Datastore";

class SearchDashboard extends Component {
  render() {
    const services = _.assign(
      {},
      this.props.postService,
      this.props.pricingService,
      this.props.dataService,
      this.props.identityService
    );

    return <Datastore services={services} domain={"all"} />;
  }
}

export default SearchDashboard;
