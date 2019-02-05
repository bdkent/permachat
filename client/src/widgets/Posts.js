import _ from "lodash";

import React from "react";
import {connect} from "react-redux";

import {Card, CardBody, CardTitle} from "reactstrap";

import {Timeline, TimelineItem} from "vertical-timeline-component-for-react";

import Post from "./Post";
import PostMeta from "./PostMeta";
import HoverHOC from "../hoc/HoverHOC";

const HoverableTimelineItem = HoverHOC(props => {
  return <TimelineItem {...props} />;
}, "attention");

const isMe = (address, providers) => {
  return _.some(providers, p => p.identityAddress === address);
};

const TimelinePost = props => {
  const PostComponent = props.PostComponent || Post;
  const {post, mine} = props;

  const meta = <PostMeta post={post} mine={mine} services={props.services}/>;
  return (
    <HoverableTimelineItem dateComponent={meta}>
      <div className="mb-4">
        <PostComponent {...props} post={post} mine={mine}/>
      </div>
    </HoverableTimelineItem>
  );
};

const StatefulTimelinePost = connect(
  (state, ownProps) => {
    return {
      mine: _.isNil(state.myIdentityProviders) ? false : isMe(ownProps.post.poster, state.myIdentityProviders)
    };
  }
)(TimelinePost);

const Posts = props => {
  const {posts} = props;

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
        {_.map(posts, (p, i) => {
          return (
            <StatefulTimelinePost key={p.hash + "-" + i} post={p} {...itemProps} />
          );
        })}
      </Timeline>
    );
  }
};

export default Posts;
