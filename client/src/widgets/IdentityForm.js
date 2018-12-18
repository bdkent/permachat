import _ from "lodash";
import React from "react";

import { Button, Form, FormGroup, Input } from "reactstrap";

import LoadableHOC from "../hoc/LoadableHOC";
import ConditionalHOC from "../hoc/ConditionalHOC";

const ProviderLabels = {
  twitter: "Twitter",
  github: "GitHub"
};

const IdentityProviderInput = LoadableHOC(
  props => {
    return (
      <FormGroup>
        <h2>1. Pick a Provider</h2>
        <Input type="select" value={props.value} onChange={props.onChange}>
          <option>choose a service to create an identity</option>
          {_.map(props.providers, provider => {
            return (
              <option key={provider} value={provider}>
                {ProviderLabels[provider]}
              </option>
            );
          })}
        </Input>
      </FormGroup>
    );
  },
  {
    providers: props => props.identityService.getProviders()
  }
);

const IdentityUserNameInput = ConditionalHOC(props => {
  return (
    <FormGroup>
      <h2>2. Enter User Name</h2>
      <Input value={props.value} onChange={props.onChange} />
    </FormGroup>
  );
});

const IdentityTokenInput = ConditionalHOC(props => {
  return (
    <React.Fragment>
      <FormGroup>
        <h2>3. Post Token</h2>
        <p>
          <code>{props.token}</code>
        </p>
      </FormGroup>
    </React.Fragment>
  );
});

const IdentityEvidenceInput = ConditionalHOC(props => {
  const cents = props.pricingService.convertWeiToDollars(props.priceInWei);
  return (
    <React.Fragment>
      <FormGroup>
        <h2>4. Evidence URI</h2>
        <Input value={props.value} onChange={props.onChange} />
      </FormGroup>
      {_.toString(props.priceInWei)} - {_.toString(cents)}
      <FormGroup>
        <Button color="primary" block={true} onClick={props.requestIdentity}>
          Request Verification
        </Button>
      </FormGroup>
    </React.Fragment>
  );
});

const IdentityForm = LoadableHOC(
  class extends React.Component {
    state = {
      provider: "",
      userName: "",
      token: null,
      evidence: ""
    };

    constructor(props) {
      super(props);

      this.changeProvider = this.changeProvider.bind(this);
      this.changeUserName = this.changeUserName.bind(this);
      this.createToken = this.createToken.bind(this);
      this.changeEvidence = this.changeEvidence.bind(this);
      this.requestIdentity = this.requestIdentity.bind(this);
    }

    changeProvider(event) {
      const value = event.target.value;
      this.setState({
        provider: value,
        userName: "",
        token: null,
        evidence: ""
      });
    }

    changeUserName(event) {
      const value = event.target.value;
      this.setState(
        {
          userName: value,
          token: null,
          evidence: ""
        },
        this.createToken
      );
    }

    changeEvidence(event) {
      const value = event.target.value;
      this.setState({
        evidence: value
      });
    }

    async createToken() {
      const token = await this.props.identityService.createToken(
        this.state.provider,
        this.state.userName
      );
      this.setState({
        token: token
      });
    }

    async requestIdentity() {
      return this.props.identityService.requestIdentity(this.state.evidence);
    }

    render() {
      return (
        <div>
          <Form>
            <IdentityProviderInput
              {...this.props}
              value={this.state.provider}
              onChange={this.changeProvider}
            />
            <IdentityUserNameInput
              value={this.state.userName}
              onChange={this.changeUserName}
              show={!_.isEmpty(this.state.provider)}
            />
            <IdentityTokenInput
              token={this.state.token}
              show={
                !_.isEmpty(this.state.provider) &&
                !_.isEmpty(this.state.userName)
              }
            />
            <IdentityEvidenceInput
              {...this.props}
              value={this.state.evidence}
              onChange={this.changeEvidence}
              requestIdentity={this.requestIdentity}
              show={
                !_.isEmpty(this.state.provider) &&
                !_.isEmpty(this.state.userName)
              }
            />
          </Form>
        </div>
      );
    }
  },
  {
    priceInWei: props => props.identityService.getRequestPriceInWei()
  }
);

export default IdentityForm;
