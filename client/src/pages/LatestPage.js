import _ from "lodash";
import React, {Component} from "react";

import Posts from "../widgets/Posts";

class LatestPage extends Component {
  state = {posts: []};

  constructor(props) {
    super(props);

    this.onNewTweet = this.onNewTweet.bind(this);
  }

  componentDidMount = async () => {
    this.props.postService.registerNewPostHandler(this.onNewTweet);
    this.load();
  };

  componentWillUnmount = async () => {
    this.props.postService.unregisterNewPostHandler(this.onNewTweet);
  };

  async load() {
    const posts = await this.props.postService.loadRecentPosts();
    this.setState({
      posts: posts || []
    });
  }

  async onNewTweet(post) {
    if (!this.props.postService.isMyAccount(post.poster)) {
      this.setState(prevState => {
        return {
          posts: [post].concat(prevState.posts)
        };
      });
    }
  }

  render() {
    const services = _.assign(
      {},
      this.props.postService
    );
    return (
      <Posts
        posts={this.state.posts}
        mine={false}
        services={services}
        showThread={true}
      />
    );
  }
}

export default LatestPage;
