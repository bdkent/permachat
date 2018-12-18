import React from "react";

import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBold,
  faHeading,
  faItalic,
  faStrikethrough,
  faLink,
  faQuoteRight,
  faCode,
  faImage,
  faListUl,
  faListOl,
  faTasks
} from "@fortawesome/free-solid-svg-icons";

const icons = {
  bold: <FontAwesomeIcon icon={faBold} />,
  heading: <FontAwesomeIcon icon={faHeading} />,
  italic: <FontAwesomeIcon icon={faItalic} />,
  strikethrough: <FontAwesomeIcon icon={faStrikethrough} />,
  link: <FontAwesomeIcon icon={faLink} />,
  "quote-right": <FontAwesomeIcon icon={faQuoteRight} />,
  code: <FontAwesomeIcon icon={faCode} />,
  image: <FontAwesomeIcon icon={faImage} />,
  "list-ul": <FontAwesomeIcon icon={faListUl} />,
  "list-ol": <FontAwesomeIcon icon={faListOl} />,
  tasks: <FontAwesomeIcon icon={faTasks} />
};

const iconProvider = name => icons[name] || "❓";

class MarkdownEditor extends React.Component {
  state = {
    editorState: {
      markdown: this.props.value
    }
  };

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  componentWillReceiveProps = ({ value }) => {
    if (value !== this.state.editorState.markdown) {
      this.setState({
        editorState: {
          markdown: value
        }
      });
    }
  };

  onChange(mdeState) {
    const self = this;
    this.setState(
      {
        editorState: mdeState
      },
      () => self.props.onChange(self.state.editorState.markdown)
    );
  }

  render() {
    return (
      <ReactMde
        layout="noPreview"
        buttonContentOptions={{ iconProvider }}
        onChange={this.onChange}
        editorState={this.state.editorState}
      />
    );
  }
}

export default MarkdownEditor;
