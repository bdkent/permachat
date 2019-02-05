import _ from "lodash";
import React from "react";

import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Row, Col} from "reactstrap";
import {Button} from "reactstrap";
import {Card, CardBody, CardTitle} from "reactstrap";

import {connect} from "react-redux";

import LoadingHOC from "../hoc/LoadingHOC";
import IfElseHOC from "../hoc/IfElseHOC";
import InitializeHOC from "../hoc/InitializeHOC";

import IdentityForm from "../widgets/IdentityForm";
import IdentityProvider from "../widgets/IdentityProvider";
import * as Actions from "../state/actions";

const IdentityProviders = LoadingHOC(["providerGroups"],
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
  }
);

const StatefulIdentityProviders = connect(
  state => {
    const {myIdentityProviders} = state;
    if (_.isNil(myIdentityProviders)) {
      return {};
    } else {
      return {
        providerGroups: _.groupBy(myIdentityProviders, p => p.request.requestor)
      };
    }
  }
)(IdentityProviders);

class AddIdentityForm extends React.Component {
  state = {
    show: false
  };

  constructor(props) {
    super(props);
    this.toggleForm = this.toggleForm.bind(this);
  }

  toggleForm() {
    this.setState(previousState => {
      return {show: !previousState.show};
    });
  }

  render() {
    if (this.state.show) {
      return (
        <Card className="bg-light">
          <CardBody>
            <CardTitle className="d-flex justify-content-between w-100">
              Verify Another Identity
              <Button close onClick={this.toggleForm}/>
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
      <StatefulIdentityProviders {...props} />
      <AddIdentityForm {...props} />
    </div>
  );
};

const IdentityContent = IfElseHOC(
  "identityInfo",
  IdentityDetails,
  IdentityForm
);

const MyIdentityPage = connect(
  state => {
    return {
      identityInfo: state.myIdentity,
    };
  },
  dispatch => {
    return {
      fetchMyIdentity: () => {
        dispatch(Actions.fetchMyIdentityProviders());
      }
    };
  }
)(InitializeHOC(props => props.fetchMyIdentity(), IdentityContent));

export default MyIdentityPage;
