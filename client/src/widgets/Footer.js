import React from "react";

import { Navbar, Nav, NavItem, NavLink } from "reactstrap";

import { NavLink as RouterNavLink } from "react-router-dom";

import ExternalAnchorHOC from "../hoc/ExternalAnchorHOC";

const ExternalAnchorNavLink = ExternalAnchorHOC(NavLink);

const Footer = props => {
  return (
    <footer className="footer mt-4">
      <Navbar className="pt-0 pb-0">
        <Nav>
          <NavItem>
            <RouterNavLink
              to="/about"
              className="nav-link pt-0 pb-0"
              activeClassName="active"
            >
              About
            </RouterNavLink>
          </NavItem>
          <NavItem>
            <RouterNavLink
              to="/faq"
              className="nav-link pt-0 pb-0"
              activeClassName="active"
            >
              FAQ
            </RouterNavLink>
          </NavItem>
        </Nav>

        <Nav className="justify-content-end">
          <NavItem>
            <ExternalAnchorNavLink
              href="https://github.com/bdkent/permachat"
              className="pt-0 pb-0"
            >
              Source Code on GitHub
            </ExternalAnchorNavLink>
          </NavItem>
        </Nav>
      </Navbar>
    </footer>
  );
};

export default Footer;
