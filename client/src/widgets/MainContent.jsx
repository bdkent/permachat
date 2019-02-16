import React from "react";
import {Redirect, Route, Switch} from "react-router";

import ConditionalHOC from "../hoc/ConditionalHOC";

import MyPostsPage from "../pages/MyPostsPage";
import DiscoverPage from "../pages/DiscoverPage";
import LatestPage from "../pages/LatestPage";
import UserPage from "../pages/UserPage";
import PostPage from "../pages/PostPage";
import TagPage from "../pages/TagPage";
import SettingsPage from "../pages/SettingsPage";
import MyIdentityPage from "../pages/MyIdentityPage";

const MainContent = ConditionalHOC(
  globalProps => {
    const {
      postService,
      dataService,
      account,
      contracts
    } = globalProps;

    return (
      <Switch>
        <Route
          exact
          path="/"
          render={props => {
            return <Redirect to="/latest"/>;
          }}
        />
        <Route
          path="/post"
          render={props => {
            return (
              <MyPostsPage
                postService={postService}
              />
            );
          }}
        />
        <Route
          path="/discover"
          render={props => {
            return (
              <DiscoverPage
                postService={postService}
                dataService={dataService}
              />
            );
          }}
        />
        <Route
          path="/latest"
          render={props => {
            return (
              <LatestPage
                postService={postService}
                account={account}
              />
            );
          }}
        />
        <Route
          path="/users/:userId"
          render={props => {
            return (
              <UserPage
                dataService={dataService}
                postService={postService}
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
                postId={props.match.params.postId}
              />
            );
          }}
        />
        <Route
          path="/tags/:tag"
          render={props => {
            return (
              <TagPage
                postService={postService}
                dataService={dataService}
                tag={props.match.params.tag}
              />
            );
          }}
        />
        <Route
          path="/settings"
          render={props => {
            return <SettingsPage contracts={contracts}/>;
          }}
        />
        <Route
          path="/my/identity"
          render={props => {
            return (
              <MyIdentityPage/>
            );
          }}
        />
      </Switch>
    );
  },
  props => !!props.postService && !!props.dataService && !!props.account
);

export default MainContent;