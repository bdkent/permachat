import React, { Component } from "react";

import IpfsContentValue from "./IpfsContentValue";

class IpfsContent extends Component {
  state = { content: null };

  constructor(props) {
    super(props);

    this.refresh = this.refresh.bind(this);
  }

  componentDidMount = () => {
    this.refresh(this.props.hash);
  };

  componentWillReceiveProps = ({ hash }) => {
    if (this.props.hash !== hash) {
      this.setState({
        content: null
      });
      this.refresh(hash);
    }
  };

  async refresh(hash) {
    const path = this.toPath(hash);
    // console.log("path", path);
    const response = await fetch(path);
    // console.log("response", response);
    const content = await response.text();
    // console.log("content", content);
    this.setState({ content: content });
  }

  toPath(hash) {
    return "https://ipfs.infura.io/ipfs/" + (hash || this.props.hash);
  }

  render() {
    return (
      <span>
        <span>
          <IpfsContentValue
            hash={this.props.hash}
            content={this.state.content}
          />
        </span>
      </span>
    );
  }
}

export default IpfsContent;
