import React, { Component } from "react";

import Posts from "./Posts";

class MyPosts extends Component {
  state = {
    posts: []
  };

  constructor(props) {
    super(props);

    this.onNewPost = this.onNewPost.bind(this);
  }

  componentDidMount = () => {
    this.load();
    this.props.services.registerNewPostHandler(this.onNewPost);
  };

  componentWillUnmount = async () => {
    this.props.services.unregisterNewPostHandler(this.onNewPost);
  };

  async load() {
    const posts = await this.props.services.loadMyPosts();
    this.setState({
      posts: posts || []
    });
  }

  async onNewPost(post) {
    if (this.props.services.isMyAccount(post.poster)) {
      this.setState(prevState => {
        return {
          posts: [post].concat(prevState.posts)
        };
      });
    }
  }

  render() {
    return (
      <Posts
        posts={this.state.posts}
        mine={true}
        pinnedPostId={this.props.pinnedPostId}
        services={this.props.services}
        showThread={true}
      />
    );
  }
}

export default MyPosts;
