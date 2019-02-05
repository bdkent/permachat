import _ from "lodash";

import React from "react";
import {
  Collapse,
  Navbar,
  Nav,
  NavItem,
  NavbarBrand,
  Input
} from "reactstrap";

import {
  NavLink as RouterNavLink,
} from "react-router-dom";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import {
  faSearch,
  faBullhorn,
  faClock,
  faCog,
  faUserCircle
} from "@fortawesome/free-solid-svg-icons";

const Header = props => {
  const {accounts, account, setAccount} = props;
  return (
    <Navbar className="mb-4" color="dark" dark expand="md">
      <NavbarBrand href="/">PermaChat</NavbarBrand>

      <Nav className="ml-auto" navbar>
        <NavItem>
          <RouterNavLink
            to="/post"
            className="nav-link"
            activeClassName="active"
          >
            <FontAwesomeIcon icon={faBullhorn}/> Post
          </RouterNavLink>
        </NavItem>
        <NavItem>
          <RouterNavLink
            to="/discover"
            className="nav-link"
            activeClassName="active"
          >
            <FontAwesomeIcon icon={faSearch}/> Discover
          </RouterNavLink>
        </NavItem>
        <NavItem>
          <RouterNavLink
            to="/latest"
            className="nav-link"
            activeClassName="active"
          >
            <FontAwesomeIcon icon={faClock}/> Latest
          </RouterNavLink>
        </NavItem>
      </Nav>

      <Collapse isOpen={true} navbar>
        <Nav className="ml-auto" navbar>
          <NavItem>
            <Input
              bsSize="sm"
              type="select"
              value={account}
              onChange={setAccount}
              className="mt-1"
            >
              {_.map(accounts, a => {
                return (
                  <option key={a} value={a}>
                    {account.substring(0, 8)}...
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
              <FontAwesomeIcon icon={faUserCircle} size="lg"/>
            </RouterNavLink>
          </NavItem>
          <NavItem className="ml-2">
            <RouterNavLink
              to="/settings"
              className="nav-link"
              activeClassName="active"
            >
              <FontAwesomeIcon icon={faCog} size="lg"/>
            </RouterNavLink>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>);
};

export default Header;