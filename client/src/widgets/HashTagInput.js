import _ from "lodash";

import React, { Component } from "react";

import { WithContext as ReactTags } from "react-tag-input";

const KeyCodes = {
  comma: 188,
  enter: 13
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

class HashTagInput extends Component {
  state = {
    tags: []
  };

  constructor(props) {
    super(props);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAddition = this.handleAddition.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.setTags = this.setTags.bind(this);
  }

  setTags() {
    this.props.setTags(_.map(this.state.tags, t => t.text));
  }

  handleDelete(i) {
    const { tags } = this.state;
    this.setState(
      {
        tags: tags.filter((tag, index) => index !== i)
      },
      this.setTags
    );
  }

  handleAddition(rawTag) {
    const value = "#" + _.kebabCase(rawTag.text.toString());
    const tag = {
      id: value,
      text: value
    };

    this.setState(
      state => ({
        tags: [...state.tags, tag]
      }),
      this.setTags
    );
  }

  handleDrag(tag, currPos, newPos) {
    const tags = [...this.state.tags];
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags: newTags }, this.setTags);
  }

  render() {
    return (
      <ReactTags
        tags={this.state.tags}
        classNames={{
          tagInputField: "form-control mt-2",
          tag: "badge badge-secondary badge-pill mr-1 pl-2 pr-2 pt-1 pb-1",
          remove: "ml-1 p-1"
        }}
        autofocus={false}
        handleDelete={this.handleDelete}
        handleAddition={this.handleAddition}
        handleDrag={this.handleDrag}
        delimiters={delimiters}
      />
    );
  }
}

export default HashTagInput;
