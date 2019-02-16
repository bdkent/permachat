import _ from "lodash";
import React from "react";

import {connect} from "react-redux";

import {
  Alert,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  Label,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  CardTitle
} from "reactstrap";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTwitter, faGithub} from "@fortawesome/free-brands-svg-icons";

import * as Actions from "../state/actions";

import LoadingHOC from "../hoc/LoadingHOC";
import ConditionalHOC from "../hoc/ConditionalHOC";

import ExternalAnchor from "./ExternalAnchor";
import WorkerButton from "./WorkerButton";
import Dollars from "./Dollars";

const Providers = {
  twitter: {
    label: "Twitter",
    icon: <FontAwesomeIcon icon={faTwitter}/>,
    userNamePrefix: "@",
    userNameProfilePreview: userName =>
      "<a class=\"twitter-timeline\" href=\"https://twitter.com/" +
      userName +
      "?ref_src=twsrc%5Etfw\">Tweets by " +
      userName +
      "</a> <script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script> ",
    evidenceUriTemplate: userName =>
      "https://twitter.com/" + userName + "/status/[[TOKEN]]",
    evidenceDirections: (
      <React.Fragment>
        <p>
          Go make a tweet where the content is <em>only</em> that code from
          above.
        </p>
        <p>Look at the URL of the tweet you just created.</p>
      </React.Fragment>
    ),
    evidencePreview: (userName, evidence) => {
      return (
        "<blockquote class=\"twitter-tweet\" data-lang=\"en\"><p lang=\"en\" dir=\"ltr\">content</p>&mdash; @" +
        userName +
        "<a href=\"https://twitter.com/" +
        userName +
        "/status/" +
        evidence +
        "?ref_src=twsrc%5Etfw\"></a></blockquote><script async src=\"https://platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>"
      );
    }
  },
  github: {
    label: "GitHub",
    icon: <FontAwesomeIcon icon={faGithub}/>,
    userNamePrefix: null,
    userNameProfilePreview: userName =>
      "<div class=\"github-card\" data-github=\"" +
      userName +
      "\" data-xwidth=\"400\" data-xheight=\"152\" data-theme=\"default\"></div><script src=\"//cdn.jsdelivr.net/github-cards/latest/widget.js\"></script>",
    evidenceUriTemplate: userName =>
      "https://gist.github.com/" + userName + "/[[TOKEN]]",
    evidenceDirections: (
      <React.Fragment>
        <p>
          Go create a secret{" "}
          <ExternalAnchor href="https://gist.github.com">
            GitHub Gist
          </ExternalAnchor>{" "}
          where the content is <em>only</em> that code from above.
        </p>
        <p>Look at the URL of the Gist you just create.</p>
      </React.Fragment>
    ),
    evidencePreview: (userName, evidence) => {
      return (
        "<script src=\"https://gist.github.com/" +
        userName +
        "/" +
        evidence +
        ".js\"></script>"
      );
    }
  }
};

const IdentityProviderInput = connect(state => {
    return {
      providers: state.providers
    };
  }
)(
  props => {
    return (
      <FormGroup>
        <Label>Pick a Provider to Assess Your Online Identity</Label>
        <Input type="select" value={props.value} onChange={props.onChange}>
          <option value="">choose a service to create an identity</option>
          {_.map(props.providers, provider => {
            return (
              <option key={provider} value={provider}>
                {Providers[provider].label}
              </option>
            );
          })}
        </Input>
      </FormGroup>
    );
  }
);

const UserNamePrefix = ConditionalHOC(props => {
  return <InputGroupAddon addonType="prepend">{props.prefix}</InputGroupAddon>;
}, "prefix");

const IdentityUserNameInput = ConditionalHOC(props => {
  return (
    <FormGroup>
      <Label>Enter {Providers[props.provider].label} User Name</Label>
      <InputGroup>
        <UserNamePrefix prefix={props.prefix}/>
        <Input value={props.value} onChange={props.onChange}/>
      </InputGroup>
    </FormGroup>
  );
});

const IdentityTokenInput = ConditionalHOC(props => {
  const templateTokens = _.split(
    Providers[props.provider].evidenceUriTemplate(props.userName),
    "[[TOKEN]]"
  );
  return (
    <React.Fragment>
      <FormGroup>
        <Label>This code has been generated for you:</Label>
        <Alert color="secondary">
          <code>{props.token}</code>
        </Alert>
        {Providers[props.provider].evidenceDirections}
        <p>It should look something like this:</p>
        <Alert color="secondary">
          {_.map(templateTokens, (token, i) => {
            return (
              <span key={i}>
                {_.isEmpty(token) ? (
                  <strong>[some crazy jumble of numbers and/or letters]</strong>
                ) : (
                  token
                )}
              </span>
            );
          })}
        </Alert>
      </FormGroup>
    </React.Fragment>
  );
});

const IdentityEvidenceInput = ConditionalHOC(props => {
  return (
    <React.Fragment>
      <FormGroup>
        <Label>
          Now enter that crazy jumble (if there is a question mark and other
          stuff, do not include it)
        </Label>
        <Input value={props.value} onChange={props.onChange}/>
      </FormGroup>
    </React.Fragment>
  );
});

const ProviderSpecificIdentityForm = ConditionalHOC(props => {
  return (
    <React.Fragment>
      <IdentityUserNameInput
        provider={props.provider}
        value={props.userName}
        onChange={props.changeUserName}
        prefix={Providers[props.provider].userNamePrefix}
        show={!_.isEmpty(props.provider)}
      />
      <IdentityTokenInput
        provider={props.provider}
        userName={props.userName}
        token={props.token}
        show={!_.isEmpty(props.provider) && !_.isEmpty(props.userName)}
      />

      <IdentityEvidenceInput
        {...props}
        value={props.evidence}
        onChange={props.changeEvidence}
        requestIdentity={props.requestIdentity}
        show={!_.isEmpty(props.provider) && !_.isEmpty(props.userName)}
      />
    </React.Fragment>
  );
}, "provider");

const LoadingIFrame = class extends React.Component {
  state = {
    loading: true,
    ok: false
  };

  constructor(props) {
    super(props);

    this.onLoad = this.onLoad.bind(this);
  }

  componentWillReceiveProps = newProps => {
    if (
      this.props.src !== newProps.src ||
      this.props.srcDoc !== newProps.srcDoc
    ) {
      this.setState({
        loading: true,
        ok: false
      });
    }
  };

  onLoad(event) {
    // TODO: is it really possible to validate when the iframe doesn't work?
    // seems like cross-site junk makes it impossible
  }

  render() {
    const props = this.props;

    if (!this.state.loading && !this.state.ok) {
      return <p>bad</p>;
    } else {
      return (
        <iframe onLoad={this.onLoad} {...props} title={_.uniq()}>
          {props.children}
        </iframe>
      );
    }
  }
};

const VerifyForm = ConditionalHOC(props => {

  const {priceInWei} = props;

  return (
    <React.Fragment>
      <Card className="bg-light mb-4 text-center">
        <CardHeader>Verify Everything Looks Good</CardHeader>
        <CardBody>
          <Row>
            <Col md={6}>
              <CardTitle>Is this you?</CardTitle>
              <LoadingIFrame
                className="w-100"
                frameBorder="1"
                width="100%"
                srcDoc={Providers[props.provider].userNameProfilePreview(
                  props.userName
                )}
              />
            </Col>
            <Col md={6}>
              <CardTitle>
                Is this the post on {Providers[props.provider].label} you just
                made?
              </CardTitle>
              <LoadingIFrame
                className="w-100"
                frameBorder="1"
                width="100%"
                srcDoc={Providers[props.provider].evidencePreview(
                  props.userName,
                  props.evidence
                )}
              >
                HI
              </LoadingIFrame>
            </Col>
          </Row>
          <p className="text-muted mb-0 mt-4">
            if either of the above boxes are empty, double check what you
            entered in the text boxes
          </p>
        </CardBody>
      </Card>
      <Alert className="text-center" color="info">
        <p>It costs a little bit of Ether to request a new identity.</p>
        <p>
          The price is approximate $1 USD, but Ether prices can fluxuate wildly.
        </p>
        <p>
          The current cost is about <strong><Dollars wei={priceInWei}/></strong>{" "}
          <small>({_.toString(props.priceInWei)} wei)</small>
        </p>
      </Alert>
      <FormGroup>
        <WorkerButton
          color="primary"
          block={true}
          onClick={props.requestIdentity}
        >
          Request Verification
        </WorkerButton>
      </FormGroup>
    </React.Fragment>
  );
}, "evidence");

const IdentityForm = connect(
  state => {
    return {
      priceInWei: state.identityRequestPriceInWei,
      provider: _.get(state, ["identityRequestForm", "provider"], ""),
      userName: _.get(state, ["identityRequestForm", "username"], ""),
      token: _.get(state, ["identityRequestForm", "token"], ""),
      evidence: _.get(state, ["identityRequestForm", "evidence"], "")
    };
  },
  (dispatch, ownProps) => {
    return {
      setProvider: (provider) => {
        dispatch(Actions.setIdentityRequestFormProvider(provider));
      },
      setUsername: (username) => {
        dispatch(Actions.setIdentityRequestFormUsername(username));
      },
      setEvidence: (evidence) => {
        dispatch(Actions.setIdentityRequestFormEvidence(evidence));
      },
      doRequest: (provider, username, evidence) => {
        dispatch(Actions.doIdentityRequest(provider, username, evidence));
      }
    };
  }
)(LoadingHOC(["priceInWei"],
  class extends React.Component {

    constructor(props) {
      super(props);

      this.changeProvider = this.changeProvider.bind(this);
      this.changeUserName = this.changeUserName.bind(this);
      this.changeEvidence = this.changeEvidence.bind(this);
      this.requestIdentity = this.requestIdentity.bind(this);
    }

    changeProvider(event) {
      const value = event.target.value;
      this.props.setProvider(value);
    }

    changeUserName(event) {
      const value = event.target.value;
      this.props.setUsername(value);
    }

    changeEvidence(event) {
      const value = event.target.value;
      this.props.setEvidence(value);
    }

    requestIdentity() {
      return this.props.doRequest(this.props.provider, this.props.userName, this.props.evidence);
    }

    render() {
      const subProps = _.assign({}, this.props, {
        changeUserName: this.changeUserName,
        changeEvidence: this.changeEvidence,
        requestIdentity: this.requestIdentity
      });

      return (
        <div>
          <Form>
            <IdentityProviderInput
              {...this.props}
              value={this.props.provider}
              onChange={this.changeProvider}
            />
            <ProviderSpecificIdentityForm {...subProps} />
            <VerifyForm
              {...this.props}
              requestIdentity={this.requestIdentity}
            />
          </Form>
        </div>
      );
    }
  }
));

export default IdentityForm;
