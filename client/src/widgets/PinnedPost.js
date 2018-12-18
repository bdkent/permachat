import _ from "lodash";

import React from "react";
import { Card, CardBody, Row, Col } from "reactstrap";

import LoadableHOC from "../hoc/LoadableHOC";
import Post from "./Post";
import PostMeta from "./PostMeta";

const PinnedPost = LoadableHOC(
  class extends React.Component {
    render() {
      const props = _.omit(this.props, ["services"]);
      return (
        <Card className="mb-4 bg-light">
          <CardBody>
            <Row>
              <Col md={8}>
                <Post {...props} mine={true} services={this.props.services} />
              </Col>
              <Col md={4}>
                <PostMeta
                  post={this.props.post}
                  services={this.props.services}
                />
              </Col>
            </Row>
          </CardBody>
        </Card>
      );
    }
  },
  {
    post: props => props.services.loadPinnedPost()
  }
);

export default PinnedPost;
