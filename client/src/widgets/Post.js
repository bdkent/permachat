import _ from "lodash";
import React from "react";
import PropTypes from "prop-types";

import { Button, ButtonGroup } from "reactstrap";
import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from "reactstrap";

import { Card, CardBody, CardHeader } from "reactstrap";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBill,
  faThumbsUp,
  faThumbsDown,
  faSkull,
  faReply,
  faThumbtack,
  faComments
} from "@fortawesome/free-solid-svg-icons";
import { faEthereum } from "@fortawesome/free-brands-svg-icons";

import QuotedContent from "./QuotedContent";

import IpfsContent from "./IpfsContent";
import ConditionalHOC from "../hoc/ConditionalHOC";
import DerivedStateHOC from "../hoc/DerivedStateHOC";
import LoadingHOC from "../hoc/LoadingHOC";
import HoverHOC from "../hoc/HoverHOC";
import IfElseHOC from "../hoc/IfElseHOC";
import PostForm from "./PostForm";

import BigNumberUtils from "../utils/BigNumberUtils";

const TipDenominations = {
  cent: 1,
  nickel: 5,
  quarter: 25,
  dollar: 100
};

const Ether = ({ value }) => {
  return (
    <span title={value + " ETH"}>
      {_.round(value, 6).toString()}
      <FontAwesomeIcon className="ml-1 mr-1" icon={faEthereum} />
    </span>
  );
};

class Tip extends React.Component {
  state = { isOpen: false, prices: {} };

  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount = async () => {
    this.refresh();
  };

  toggle() {
    this.setState(prevState => {
      return {
        isOpen: !prevState.isOpen
      };
    });
  }

  refresh() {
    const self = this;
    self.setState({
      prices: _.mapValues(TipDenominations, amount =>
        this.props.toEtherFromCents(amount)
      )
    });
  }

  render() {
    var self = this;
    return (
      <span>
        <ButtonDropdown
          size="sm"
          isOpen={this.state.isOpen}
          toggle={this.toggle}
          onClick={this.refresh}
        >
          <DropdownToggle
            caret
            color={this.props.attention ? "success" : "secondary"}
          >
            <FontAwesomeIcon icon={faMoneyBill} className="mr-1" />
            Tip
          </DropdownToggle>
          <DropdownMenu>
            {_.map(TipDenominations, (amount, name) => {
              const ether = self.state.prices[name];
              return (
                <DropdownItem
                  key={amount}
                  onClick={() => self.props.tip(ether)}
                >
                  <span className="mr-1">a {name}</span>
                  <span className="text-muted">
                    (~ <Ether value={ether} />)
                  </span>
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </ButtonDropdown>
      </span>
    );
  }
}

const PostContent = ({ content }) => {
  return (
    <div className="h4">
      <QuotedContent>
        <IpfsContent hash={content} />
      </QuotedContent>
    </div>
  );
};

const Pin = ConditionalHOC(
  ({ attention, hasPin, isPinned, togglePin }) => {
    const Icon = ({ hasPin }) => {
      return (
        <React.Fragment>
          <FontAwesomeIcon
            icon={faThumbtack}
            transform={hasPin ? "rotate-45" : ""}
          />
          <span className="ml-2">{hasPin ? "Unpin" : "Pin"}</span>
        </React.Fragment>
      );
    };

    return (
      <Button
        size="sm"
        className="mr-2"
        color={attention && isPinned ? "warning" : "secondary"}
        onClick={togglePin}
        active={isPinned}
      >
        <Icon hasPin={hasPin} />
      </Button>
    );
  },
  props => !props.hasPin || props.isPinned
);

const PostMyToolbar = ConditionalHOC(
  ({ attention, hasPin, isPinned, togglePin }) => {
    return (
      <Pin
        attention={attention}
        hasPin={hasPin}
        isPinned={isPinned}
        togglePin={togglePin}
      />
    );
  }
);

const CommentaryToolbar = ConditionalHOC(props => {
  const { attention, upvote, downvote, flag, tip, toEtherFromCents } = props;
  return (
    <React.Fragment>
      <Tip
        attention={attention}
        toEtherFromCents={toEtherFromCents}
        tip={tip}
      />
      <ButtonGroup size="sm" className="ml-2 mr-2">
        <Button onClick={upvote}>
          <FontAwesomeIcon icon={faThumbsUp} />
        </Button>
        <Button onClick={downvote}>
          <FontAwesomeIcon icon={faThumbsDown} />
        </Button>
      </ButtonGroup>
      <Button
        size="sm"
        onClick={flag}
        color={attention ? "danger" : "secondary"}
      >
        <FontAwesomeIcon icon={faSkull} className="mr-1" /> Flag
      </Button>
    </React.Fragment>
  );
});

const PostOthersToolbar = ConditionalHOC(props => {
  const { attention, toggleReply, replying, hasMyCommentary } = props;
  return (
    <React.Fragment>
      <Button
        size="sm"
        className="mr-2"
        color={attention ? "primary" : "secondary"}
        onClick={toggleReply}
        active={replying}
      >
        <FontAwesomeIcon icon={faReply} className="mr-1" /> Reply
      </Button>
      <CommentaryToolbar {...props} show={!hasMyCommentary} />
    </React.Fragment>
  );
});

const PostToolbar = ({
  attention,
  mine,
  toggleReply,
  replying,
  isPinned,
  hasPin,
  togglePin,
  upvote,
  downvote,
  flag,
  tip,
  toEtherFromCents,
  hasMyCommentary
}) => {
  const opacity = attention ? 1 : 0.25;
  return (
    <span style={{ opacity: opacity }}>
      <PostMyToolbar
        attention={attention}
        isPinned={isPinned}
        hasPin={hasPin}
        togglePin={togglePin}
        show={mine}
      />
      <PostOthersToolbar
        attention={attention}
        toggleReply={toggleReply}
        replying={replying}
        upvote={upvote}
        downvote={downvote}
        flag={flag}
        tip={tip}
        toEtherFromCents={toEtherFromCents}
        show={!mine}
        hasMyCommentary={hasMyCommentary}
      />
    </span>
  );
};

const Reply = ConditionalHOC(
  class extends React.Component {
    render() {
      return (
        <Card className="mt-4 xbg-light">
          <CardHeader>
            <span className="float-right">
              <button
                type="button"
                className="close"
                aria-label="Close"
                onClick={this.props.toggleReply}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </span>
            Replying
          </CardHeader>

          <CardBody>
            <PostForm doPost={this.props.addReply} />
          </CardBody>
        </Card>
      );
    }
  }
);

const ViewParentThread = ConditionalHOC(({ postId }) => {
  return (
    <p className="mb-2">
      <Link to={"/posts/" + postId}>
        <FontAwesomeIcon className="mr-2" icon={faReply} />
        view parent thread of this reply
      </Link>
    </p>
  );
});

const ViewChildrenThread = ConditionalHOC(({ postId, count }) => {
  return (
    <p className="mt-2">
      <Link to={"/posts/" + postId}>
        <FontAwesomeIcon className="mr-2" icon={faComments} />
        view responses ({count})
      </Link>
    </p>
  );
});

class GoodPost extends React.Component {
  state = {
    replying: false
  };

  constructor(props) {
    super(props);

    this.toggleReply = this.toggleReply.bind(this);
    this.togglePin = this.togglePin.bind(this);
    this.upvote = this.upvote.bind(this);
    this.downvote = this.downvote.bind(this);
    this.flag = this.flag.bind(this);
    this.tip = this.tip.bind(this);
    this.toEtherFromCents = this.toEtherFromCents.bind(this);
    this.addReply = this.addReply.bind(this);
  }

  toggleReply() {
    this.setState(prevState => {
      return {
        replying: !prevState.replying
      };
    });
  }

  async togglePin() {
    if (_.isNil(this.props.pinnedPostId)) {
      return this.props.services.pinPost(this.props.post.id);
    } else {
      return this.props.services.unpin();
    }
  }

  async upvote() {
    return this.props.services.addUpvote(this.props.post.id);
  }

  async downvote() {
    return this.props.services.addDownvote(this.props.post.id);
  }

  async tip(ether) {
    return this.props.services.addTip(this.props.post.id, ether);
  }

  async flag() {
    return this.props.services.addFlag(this.props.post.id);
  }

  toEtherFromCents(cents) {
    return this.props.services.convertCentsToEther(cents);
  }

  addReply(content, tags, contentType) {
    return this.props.services.addReplyFromContent(
      this.props.post.id,
      content,
      tags,
      contentType
    );
  }

  render() {
    const { post, mine, attention, pinnedPostId, hasMyCommentary } = this.props;

    const showParentThread =
      this.props.showParentThread || this.props.showThread;
    const showChildrenThread =
      this.props.showChildrenThread || this.props.showThread;

    const { replying } = this.state;

    const isPinned = BigNumberUtils.eq(post.id, pinnedPostId);
    const hasPin = !_.isNil(pinnedPostId);

    return (
      <div>
        <ViewParentThread
          postId={this.props.replyParentId}
          show={showParentThread && !_.isNil(this.props.replyParentId)}
        />
        <PostContent content={post.hash} />
        <div className="mt-2">
          <PostToolbar
            mine={mine}
            attention={attention || replying}
            toggleReply={this.toggleReply}
            replying={replying}
            togglePin={this.togglePin}
            isPinned={isPinned}
            hasPin={hasPin}
            upvote={this.upvote}
            downvote={this.downvote}
            tip={this.tip}
            flag={this.flag}
            toEtherFromCents={this.toEtherFromCents}
            hasMyCommentary={hasMyCommentary}
          />
        </div>
        <Reply
          show={replying}
          toggleReply={this.toggleReply}
          addReply={this.addReply}
        />
        <ViewChildrenThread
          postId={post.id}
          count={_.size(this.props.replyIds)}
          show={showChildrenThread && !_.isEmpty(this.props.replyIds)}
        />
        <div>{this.props.children}</div>
      </div>
    );
  }
}

const FlaggedPost = ({ overrideFlag }) => {
  return (
    <div className="text-danger text-center mt-4" onClick={overrideFlag}>
      <FontAwesomeIcon icon={faSkull} size="4x" />
      <p className="mt-4 mb-0">This post has been flagged.</p>
      <p className="mb-4">Click to view anyway.</p>
    </div>
  );
};

const StatelessPost = IfElseHOC("isFlagged", FlaggedPost, GoodPost);

class FlagOverridablePost extends React.Component {
  state = {
    isFlagged: this.props.isFlagged
  };

  constructor(props) {
    super(props);
    this.overrideFlag = this.overrideFlag.bind(this);
  }

  componentWillReceiveProps = newProps => {
    if (newProps.isFlagged !== this.props.isFlagged) {
      this.setState({
        isFlagged: newProps.isFlagged
      });
    }
  };

  overrideFlag() {
    this.setState({
      isFlagged: false
    });
  }

  render() {
    var props = {
      isFlagged: this.state.isFlagged,
      overrideFlag: this.overrideFlag
    };
    return <StatelessPost {...this.props} {...props} />;
  }
}

const Post = DerivedStateHOC(
  LoadingHOC(["isFlagged"], HoverHOC(FlagOverridablePost, "attention")),
  {
    hasMyCommentary: props => props.services.hasMyCommentary(props.post.id),
    isFlagged: props => props.services.isPostFlagged(props.post.id),
    replyIds: props => props.services.getReplyIds(props.post.id),
    replyParentId: props => props.services.getReplyParentId(props.post.id)
  }
);

Post.propTypes = {
  post: PropTypes.any.isRequired
};

export default Post;
