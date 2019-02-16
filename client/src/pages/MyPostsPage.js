import _ from "lodash";

import React, {Component} from "react";

import {Card, CardBody, Jumbotron} from "reactstrap";

import {connect} from "react-redux";

import DerivedStateHOC from "../hoc/DerivedStateHOC";
import ConditionalHOC from "../hoc/ConditionalHOC";
import IfElseHOC from "../hoc/IfElseHOC";
import InitializeHOC from "../hoc/InitializeHOC";

import PostForm from "../widgets/PostForm";
import MyPosts from "../widgets/MyPosts";
import PinnedPost from "../widgets/PinnedPost";
import * as Actions from "../state/actions";

const ConditionalPinnedPost = ConditionalHOC(PinnedPost, "pinnedPostId");

const UnidentitiedMyPostsPage = props => {
  return (
    <Jumbotron>
      <p>You cannot post anonymously.</p>
      <p>
        In order to create a post, you must associate your Ethereum address with
        a verified online identity.
      </p>
      <p>To begin, click the user icon at the top.</p>
    </Jumbotron>
  );
};

const IdentitiedMyPostsPage = DerivedStateHOC(
  class extends Component {
    render() {
      const services = _.assign(
        {},
        this.props.postService
      );

      const props = {
        pinnedPostId: this.props.pinnedPostId
      };

      return (
        <div>
          <Card className="mb-4">
            <CardBody>
              <PostForm doPost={services.addPostFromContent}/>
            </CardBody>
          </Card>
          <ConditionalPinnedPost services={services} {...props} />
          <MyPosts services={services} {...props} />
        </div>
      );
    }
  },
  {
    pinnedPostId: props => props.postService.getPinnedPost()
  }
);

const MyPostsPage = connect(
  state => {
    return {
      identity: state.myIdentity,
    };
  },
  dispatch => {
    return {
      fetchMyIdentity: () => {
        dispatch(Actions.fetchMyIdentity());
      }
    };
  }
)(InitializeHOC(props => props.fetchMyIdentity(), IfElseHOC("identity", IdentitiedMyPostsPage, UnidentitiedMyPostsPage),));

export default MyPostsPage;
