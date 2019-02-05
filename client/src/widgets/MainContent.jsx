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
      pricingService,
      identityService,
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
                pricingService={pricingService}
                identityService={identityService}
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
                pricingService={pricingService}
                dataService={dataService}
                identityService={identityService}
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
                pricingService={pricingService}
                identityService={identityService}
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
                pricingService={pricingService}
                identityService={identityService}
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
                pricingService={pricingService}
                identityService={identityService}
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
                pricingService={pricingService}
                dataService={dataService}
                identityService={identityService}
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
              <MyIdentityPage
                identityService={identityService}
                pricingService={pricingService}
              />
            );
          }}
        />
      </Switch>
    );
  },
  props => !!props.postService && !!props.dataService && !!props.account
);

export default MainContent;