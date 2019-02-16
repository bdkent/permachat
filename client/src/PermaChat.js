// import _ from "lodash";

import React, {Component} from "react";
import {
  Container,
} from "reactstrap";

import {connect} from "react-redux";

import PostService from "./services/PostService";
import DataService from "./services/DataService";

import Header from "./widgets/Header";
import MainContent from "./widgets/MainContent";
import Footer from "./widgets/Footer";

import * as Actions from "./state/actions";

const StatefulHeader = connect(
  state => {
    return {
      accounts: state.accounts,
      account: state.activeAccount
    };
  },
  dispatch => {
    return {
      setAccount: account => {
        dispatch(Actions.setActiveAccount(account));
      }
    };
  }
)(Header);

const StatefulMainContent = connect(
  state => {
    return {
      account: state.activeAccount,
      contract: state.contract
    };
  },
  dispatch => {
    return {};
  }
)(MainContent);

class PermaChat extends Component {
  state = {
    account: this.props.accounts[0],
    postService: new PostService(
      this.props.accounts[0],
      this.props.contract,
      this.props.web3
    ),
    dataService: new DataService(this.props.accounts[0], this.props.contract)
  };

  render() {
    return (
      <div>
        <Container fluid={false} className="mb-4">
          <StatefulHeader/>
          <StatefulMainContent
            postService={this.state.postService}
            dataService={this.state.dataService}
          />
        </Container>
        <Footer/>
      </div>
    );
  }
}

export default PermaChat;
