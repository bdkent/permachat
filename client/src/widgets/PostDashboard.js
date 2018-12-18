import _ from "lodash";

import React, { Component } from "react";

import { Card, CardBody } from "reactstrap";

import DerivedStateHOC from "../hoc/DerivedStateHOC";
import ConditionalHOC from "../hoc/ConditionalHOC";

import PostForm from "./PostForm";
import MyPosts from "./MyPosts";
import PinnedPost from "./PinnedPost";

const ConditionalPinnedPost = ConditionalHOC(PinnedPost, "pinnedPostId");

const PostDashboard = DerivedStateHOC(
  class extends Component {
    render() {
      const services = _.assign(
        {},
        this.props.postService,
        this.props.pricingService,
        this.props.identityService
      );

      const props = {
        pinnedPostId: this.props.pinnedPostId
      };

      return (
        <div>
          <Card className="mb-4">
            <CardBody>
              <PostForm doPost={services.addPostFromContent} />
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

export default PostDashboard;
