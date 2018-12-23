import _ from "lodash";
import React from "react";

import { Breadcrumb, BreadcrumbItem } from "reactstrap";
import { Row, Col } from "reactstrap";
import { Button } from "reactstrap";
import { Card, CardBody, CardTitle } from "reactstrap";

import LoadableHOC from "../hoc/LoadableHOC";
import IfElseHOC from "../hoc/IfElseHOC";

import IdentityForm from "../widgets/IdentityForm";
import IdentityProvider from "../widgets/IdentityProvider";

const IdentityProviders = LoadableHOC(
  props => {
    return _.map(props.providerGroups, (providers, requestor) => {
      return (
        <React.Fragment key={requestor}>
          <h3>{requestor}</h3>
          <Row className="mb-4">
            {_.map(providers, (identityProvider, i) => {
              return (
                <Col key={i} md={3}>
                  <IdentityProvider
                    {...props}
                    identityProvider={identityProvider}
                    provider={identityProvider.provider}
                  />
                </Col>
              );
            })}
          </Row>
        </React.Fragment>
      );
    });
  },
  {
    providerGroups: async props => {
      const providers = await props.identityService.getMyIdentityProviders();
      return _.groupBy(providers, p => p.request.requestor);
    }
  }
);

class AddIdentityForm extends React.Component {
  state = {
    show: false
  };

  constructor(props) {
    super(props);
    this.toggleForm = this.toggleForm.bind(this);
  }

  toggleForm() {
    console.log("toggling");
    this.setState(previousState => {
      return { show: !previousState.show };
    });
  }

  render() {
    if (this.state.show) {
      return (
        <Card className="bg-light">
          <CardBody>
            <CardTitle className="d-flex justify-content-between w-100">
              Verify Another Identity
              <Button close onClick={this.toggleForm} />
            </CardTitle>

            <IdentityForm {...this.props} />
          </CardBody>
        </Card>
      );
    } else {
      return (
        <Button block={true} onClick={this.toggleForm} className="mb-4">
          Verify Another Identity
        </Button>
      );
    }
  }
}

const IdentityDetails = props => {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem>Identity</BreadcrumbItem>
        <BreadcrumbItem active>
          {_.toString(props.identityInfo.id)}
        </BreadcrumbItem>
      </Breadcrumb>
      <IdentityProviders {...props} identityId={props.identityInfo.id} />
      <AddIdentityForm {...props} />
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
