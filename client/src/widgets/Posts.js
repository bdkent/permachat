import _ from "lodash";

import React from "react";
import { Card, CardBody, CardTitle } from "reactstrap";

import { Timeline, TimelineItem } from "vertical-timeline-component-for-react";

import Post from "./Post";
import PostMeta from "./PostMeta";
import HoverHOC from "../hoc/HoverHOC";

const HoverableTimelineItem = HoverHOC(props => {
  return <TimelineItem {...props} />;
}, "attention");

const Posts = props => {
  const { posts, mine } = props;
  const PostComponent = props.PostComponent || Post;
  if (_.isEmpty(posts)) {
    return (
      <Card>
        <CardBody>
          <CardTitle className="text-center">Nothing to Display</CardTitle>
        </CardBody>
      </Card>
    );
  } else {
    const itemProps = _.omit(props, ["posts"]);
    return (
      <Timeline className="mt-0 mb-2 pt-0">
        {posts.map((p, i) => {
          const meta = (
            <PostMeta post={p} mine={mine} services={props.services} />
          );
          return (
            <HoverableTimelineItem key={p.hash + "-" + i} dateComponent={meta}>
              <div className="mb-4">
                <PostComponent {...itemProps} post={p} />
              </div>
            </HoverableTimelineItem>
          );
        })}
      </Timeline>
    );
  }
};

export default Posts;
