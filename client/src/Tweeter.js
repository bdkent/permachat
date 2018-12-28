import React, { Component } from "react";
import {
  Collapse,
  Navbar,
  Nav,
  NavItem,
  NavLink,
  NavbarBrand,
  Container,
  Input
} from "reactstrap";

import {
  HashRouter as Router,
  Route,
  NavLink as RouterNavLink,
  Redirect
} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBullhorn,
  faClock,
  faCog,
  faUserCircle
} from "@fortawesome/free-solid-svg-icons";

import PostService from "./services/PostService";
import DataService from "./services/DataService";
import PricingService from "./services/PricingService";
import IdentityService from "./services/IdentityService";

import ConditionalHOC from "./hoc/ConditionalHOC";

import Recent from "./widgets/Recent";

import PostDashboard from "./widgets/PostDashboard";
import SearchDashboard from "./widgets/SearchDashboard";
import User from "./widgets/User";
import Tag from "./widgets/Tag";
import PostPage from "./pages/PostPage";
import SettingsPage from "./pages/SettingsPage";
import MyIdentityPage from "./pages/MyIdentityPage";

const MainContent = ConditionalHOC(
  globalProps => {
    const {
      postService,
      dataService,
      pricingService,
      identityService,
      account,
      contracts
    } = globalProps;

    return (
      <div>
        <Route
          exact
          path="/"
          render={props => {
            return <Redirect to="/latest" />;
          }}
        />
        <Route
          path="/post"
          render={props => {
            return (
              <PostDashboard
                postService={postService}
                pricingService={pricingService}
                identityService={identityService}
              />
            );
          }}
        />
        <Route
          path="/discover"
          render={props => {
            return (
              <SearchDashboard
                postService={postService}
                pricingService={pricingService}
                dataService={dataService}
                identityService={identityService}
              />
            );
          }}
        />
        <Route
          path="/latest"
          render={props => {
            return (
              <Recent
                postService={postService}
                pricingService={pricingService}
                identityService={identityService}
                account={account}
              />
            );
          }}
        />
        <Route
          path="/users/:userId"
          render={props => {
            return (
              <User
                dataService={dataService}
                postService={postService}
                pricingService={pricingService}
                identityService={identityService}
                userId={props.match.params.userId}
              />
            );
          }}
        />
        <Route
          path="/posts/:postId"
          render={props => {
            return (
              <PostPage
                postService={postService}
                pricingService={pricingService}
                identityService={identityService}
                postId={props.match.params.postId}
              />
            );
          }}
        />
        <Route
          path="/tags/:tag"
          render={props => {
            return (
              <Tag
                postService={postService}
                pricingService={pricingService}
                dataService={dataService}
                identityService={identityService}
                tag={props.match.params.tag}
              />
            );
          }}
        />
        <Route
          path="/settings"
          render={props => {
            return <SettingsPage contracts={contracts} />;
          }}
        />
        <Route
          path="/my/identity"
          render={props => {
            return (
              <MyIdentityPage
                identityService={identityService}
                pricingService={pricingService}
              />
            );
          }}
        />
      </div>
    );
  },
  props => !!props.postService && !!props.dataService && !!props.account
);

class Tweeter extends Component {
  state = {
    account: this.props.accounts[0],
    postService: new PostService(
      this.props.accounts[0],
      this.props.contract,
      this.props.web3
    ),
    dataService: new DataService(this.props.accounts[0], this.props.contract),
    pricingService: new PricingService(this.props.web3),
    identityService: new IdentityService(
      this.props.contract,
      this.props.accounts[0],
      this.props.web3
    )
  };

  constructor(props) {
    super(props);

    this.setAccount = this.setAccount.bind(this);
  }

  setAccount(account) {
    this.props.postService.setActiveAccount(account);
    this.props.identityService.setActiveAccount(account);

    this.setState({
      account: account
    });
  }

  render() {
    return (
      <Router>
        <div>
          <Container fluid={false} className="mb-4">
            <Navbar className="mb-4" color="dark" dark expand="md">
              <NavbarBrand href="/">PermaChat</NavbarBrand>

              <Nav className="ml-auto" navbar>
                <NavItem>
                  <RouterNavLink
                    to="/post"
                    className="nav-link"
                    activeClassName="active"
                  >
                    <FontAwesomeIcon icon={faBullhorn} /> Post
                  </RouterNavLink>
                </NavItem>
                <NavItem>
                  <RouterNavLink
                    to="/discover"
                    className="nav-link"
                    activeClassName="active"
                  >
                    <FontAwesomeIcon icon={faSearch} /> Discover
                  </RouterNavLink>
                </NavItem>
                <NavItem>
                  <RouterNavLink
                    to="/latest"
                    className="nav-link"
                    activeClassName="active"
                  >
                    <FontAwesomeIcon icon={faClock} /> Latest
                  </RouterNavLink>
                </NavItem>
              </Nav>

              <Collapse isOpen={true} navbar>
                <Nav className="ml-auto" navbar>
                  <NavItem>
                    <Input
                      type="select"
                      value={this.state.account}
                      onChange={this.setAccount}
                    >
                      {this.props.accounts.map(account => {
                        return (
                          <option key={account} value={account}>
                            {this.state.account.substring(0, 8)}...
                          </option>
                        );
                      })}
                    </Input>
                  </NavItem>
                  <NavItem className="ml-2">
                    <RouterNavLink
                      to="/my/identity"
                      className="nav-link"
                      activeClassName="active"
                    >
                      <FontAwesomeIcon icon={faUserCircle} size="lg" />
                    </RouterNavLink>
                  </NavItem>
                  <NavItem className="ml-2">
                    <RouterNavLink
                      to="/settings"
                      className="nav-link"
                      activeClassName="active"
                    >
                      <FontAwesomeIcon icon={faCog} size="lg" />
                    </RouterNavLink>
                  </NavItem>
                </Nav>
              </Collapse>
            </Navbar>
            <MainContent
              postService={this.state.postService}
              dataService={this.state.dataService}
              identityService={this.state.identityService}
              pricingService={this.state.pricingService}
              account={this.state.account}
              contracts={this.props.contracts}
            />
          </Container>
          <footer className="footer mt-4">
            <Navbar className="pt-0 pb-0">
              <Nav>
                <NavItem>
                  <NavLink
                    href="https://github.com/bdkent/permachat"
                    className="p-0"
                  >
                    Source Code on GitHub
                  </NavLink>
                </NavItem>
              </Nav>
            </Navbar>
          </footer>
        </div>
      </Router>
    );
  }
}

export default Tweeter;
