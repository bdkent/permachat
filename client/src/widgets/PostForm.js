import _ from "lodash";

import React, { Component } from "react";

import localForage from "localforage";

import { Form, FormGroup, Input, Row, Col } from "reactstrap";

import SwitchHOC from "../hoc/SwitchHOC";
import LoadableHOC from "../hoc/LoadableHOC";

import MarkdownEditor from "./MarkdownEditor";
import MarkdownView from "./MarkdownView";
import HashTagInput from "./HashTagInput";
import QuotedContent from "./QuotedContent";
import WorkerButton from "./WorkerButton";

const ContentTypeKey = "default-content-type";

const ViewState = {
  Edit: "edit",
  Preview: "preview"
};

const ContentType = {
  Text: "text",
  Markdown: "markdown"
};

const toToggleViewStateLabel = viewState => {
  switch (viewState) {
    case ViewState.Edit:
      return "Preview";
    case ViewState.Preview:
      return "Edit";
    default:
      return "UNKNOWN";
  }
};

const PostEditText = ({ value, update }) => {
  return (
    <Input
      type="textarea"
      maxLength="128"
      placeholder="say something already"
      value={value}
      onChange={update}
    />
  );
};

const toMapping = list => {
  return _.reduce(
    list,
    function(map, tuple) {
      map[tuple[0]] = tuple[1];
      return map;
    },
    {}
  );
};

const PostEditMarkdown = ({ value, update }) => {
  return <MarkdownEditor onChange={update} value={value} />;
};

const PostEdit = SwitchHOC(
  "contentType",
  toMapping([
    [ContentType.Text, PostEditText],
    [ContentType.Markdown, PostEditMarkdown]
  ])
);

const PostPreview = ({ value }) => {
  return (
    <QuotedContent>
      <MarkdownView content={value} />
    </QuotedContent>
  );
};

const PostWidget = SwitchHOC(
  "viewState",
  toMapping([[ViewState.Edit, PostEdit], [ViewState.Preview, PostPreview]])
);

const DefaultPostState = {
  value: "",
  tags: [],
  viewState: ViewState.Edit
};

const PostForm = LoadableHOC(
  class extends Component {
    state = _.assign({}, DefaultPostState, {
      contentType: this.props.contentType
    });

    constructor(props) {
      super(props);

      this.addPost = this.addPost.bind(this);
      this.update = this.update.bind(this);
      this.setTags = this.setTags.bind(this);
      this.toggleViewState = this.toggleViewState.bind(this);
      this.setContentType = this.setContentType.bind(this);
    }

    setTags(tags) {
      this.setState({
        tags: tags
      });
    }

    async addPost() {
      const result = this.props.doPost(
        this.state.value,
        this.state.tags,
        this.state.contentType
      );

      this.setState(DefaultPostState);

      return result;
    }

    update(e) {
      const content =
        _.isObject(e) && !_.isNil(e.target) && !_.isNil(e.target.value)
          ? e.target.value
          : e;
      if (this.state.value !== content) {
        this.setState({ value: content });
      }
    }

    toggleViewState() {
      this.setState(prevState => {
        return {
          viewState:
            prevState.viewState === ViewState.Edit
              ? ViewState.Preview
              : ViewState.Edit
        };
      });
    }

    setContentType(e) {
      const value = e.target.value;
      localForage.setItem(ContentTypeKey, value);
      this.setState({
        contentType: value
      });
    }

    render() {
      return (
        <div>
          <Form>
            <FormGroup>
              <PostWidget
                viewState={this.state.viewState}
                contentType={this.state.contentType}
                value={this.state.value}
                update={this.update}
              />
            </FormGroup>
            <FormGroup>
              <HashTagInput setTags={this.setTags} />
            </FormGroup>
            <Row>
              <Col md={8}>
                <WorkerButton
                  color="primary"
                  size="lg"
                  onClick={this.addPost}
                  disabled={_.isEmpty(this.state.value)}
                >
                  Post
                </WorkerButton>
                <WorkerButton
                  size="lg"
                  className="ml-2"
                  onClick={this.toggleViewState}
                  disabled={_.isEmpty(this.state.value)}
                >
                  {toToggleViewStateLabel(this.state.viewState)}
                </WorkerButton>
              </Col>
              <Col md={4}>
                <Input
                  type="select"
                  onChange={this.setContentType}
                  value={this.state.contentType}
                >
                  {_.map(ContentType, function(v) {
                    return (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    );
                  })}
                </Input>
              </Col>
            </Row>
          </Form>
        </div>
      );
    }
  },
  {
    contentType: props =>
      localForage
        .getItem(ContentTypeKey)
        .then(value => _.defaultTo(value, ContentType.Text))
  }
);

export default PostForm;
