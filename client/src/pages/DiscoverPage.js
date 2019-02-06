import _ from "lodash";

import React, {Component} from "react";

import Datastore from "../widgets/Datastore";

class DiscoverPage extends Component {
  render() {
    const services = _.assign(
      {},
      this.props.postService,
      this.props.pricingService,
      this.props.dataService
    );

    return <Datastore services={services} domain={"all"}/>;
  }
}

export default DiscoverPage;
