import _ from "lodash";
import React from "react";
import {connect} from "react-redux";

import {Breadcrumb, BreadcrumbItem} from "reactstrap";
import {Row, Col} from "reactstrap";

import LoadingHOC from "../hoc/LoadingHOC";
import InitializeHOC from "../hoc/InitializeHOC";

import Datastore from "../widgets/Datastore";
import IdentityProvider from "../widgets/IdentityProvider";
import * as Actions from "../state/actions";

const PureUserDetails = props => {
  const {userId, providers} = props;
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
      <dl>
        <dt>Ethereum Address</dt>
        <dd>{userId}</dd>
      </dl>
    </React.Fragment>
  );
};

const UserDetails = connect(
  (state, ownProps) => {
    const {identityProvidersMapping} = state;
    return {
      providers: _.get(identityProvidersMapping, [ownProps.userId])
    };
  },
  (dispatch, ownProps) => {
    return {
      fetchIdentityProviders: () => {
        dispatch(Actions.fetchIdentityProviders(ownProps.userId));
      }
    };
  }
)(InitializeHOC(props => props.fetchIdentityProviders(), LoadingHOC(["providers"], PureUserDetails)));

const UserPage = props => {
  const {userId} = props;

  const services = _.assign(
    {},
    props.postService,
    props.dataService
  );

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbItem>Users</BreadcrumbItem>
        <BreadcrumbItem active>{userId}</BreadcrumbItem>
      </Breadcrumb>
      <UserDetails userId={userId}/>
      <h2>Post History</h2>
      <Datastore services={services} domain={"users/" + userId}/>
    </div>
  );
};

export default UserPage;
