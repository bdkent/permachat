import _ from "lodash";
import React from "react";

import {Breadcrumb, BreadcrumbItem} from "reactstrap";

import LoadableHOC from "../hoc/LoadableHOC";
import DerivedStateHOC from "../hoc/DerivedStateHOC";
import ConditionalHOC from "../hoc/ConditionalHOC";

import Post from "../widgets/Post";

import Posts from "../widgets/Posts";

const Replies = ConditionalHOC(
  DerivedStateHOC(
    props => {
      return (
        <div>
          <Posts
            posts={props.replies}
            services={props.services}
            showParentThread={false}
            showChildrenThread={true}
          />
        </div>
      );
    },
    {
      replies: props =>
        Promise.all(
          _.map(props.replyIds, replyId => props.services.getPostById(replyId))
        )
    }
  )
);

const LoadedPost = LoadableHOC(
  DerivedStateHOC(
    props => {
      const postProps = _.omit(props, ["services"]);

      return (
        <Post {...postProps} services={props.services} show>
          <hr/>
          <Replies
            replyIds={props.replyIds}
            services={props.services}
            show={!_.isEmpty(props.replyIds)}
          />
        </Post>
      );
    },
    {
      replyIds: props => props.services.getReplyIds(props.post.id),
      replyParentId: props => props.services.getReplyParentId(props.post.id)
    }
  ),
  {
    post: props => props.services.getPostById(props.post.id)
  }
);

const PostPage = LoadableHOC(
  props => {
    const services = _.assign(
      {},
      props.postService
    );
    return (
      <div>
        <Breadcrumb>
          <BreadcrumbItem>Posts</BreadcrumbItem>
          <BreadcrumbItem active>{props.postId}</BreadcrumbItem>
        </Breadcrumb>
        <div className="mb-4 ">
          <Posts
            posts={[props.post]}
            services={services}
            showParentThread={true}
            showChildrenThread={false}
            PostComponent={LoadedPost}
          />
        </div>
      </div>
    );
  },
  {post: props => props.postService.getPostById(props.postId)}
);

export default PostPage;
