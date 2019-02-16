import _ from "lodash";
import React from "react";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSkull, faDonate} from "@fortawesome/free-solid-svg-icons";

import ConditionalHOC from "../hoc/ConditionalHOC";
import DerivedStateHOC from "../hoc/DerivedStateHOC";

import Model from "../services/Model";

import Dollars from "./Dollars";

const CommentaryType = Model.CommentaryType;

const normalize = n => n || 0;

const toSummary = commentary => {
  return _.reduce(
    commentary,
    (summary, c) => {
      const commentaryType = parseInt(c.commentaryType.toString());
      switch (commentaryType) {
        case CommentaryType.TIP:
          summary.tip = normalize(summary.tip) + c.tip;
          break;
        case CommentaryType.UPVOTE:
          summary.vote = normalize(summary.vote) + 1;
          break;
        case CommentaryType.DOWNVOTE:
          summary.vote = normalize(summary.vote) - 1;
          break;
        case CommentaryType.FLAG:
          summary.flagged = normalize(summary.flagged) + 1;
          break;
        default:
          break;
      }
      return summary;
    },
    {}
  );
};

const CommentaryBadge = ConditionalHOC(
  ({value}) => {
    return <span className="fa-layers-counter ">{value}</span>;
  },
  props => props.value > 0
);

const Flagged = ConditionalHOC(({value}) => {
  return (
    <span className="fa-layers fa-fw fa-lg">
      <FontAwesomeIcon className={""} icon={faSkull}/>
      <CommentaryBadge value={value}/>
    </span>
  );
}, "value");

const Vote = ConditionalHOC(({value}) => {
  const color = value => {
    if (value > 0) {
      return "text-success";
    } else if (value < 0) {
      return "text-danger";
    } else {
      return "text-muted";
    }
  };

  return (
    <span className={color(value)}>
      {value > 0 ? "+" : ""}
      {value}
    </span>
  );
}, "value");

const Tip = ConditionalHOC(({value}) => {
  return (
    <span className="text-success">
      <FontAwesomeIcon className={"mr-1"} icon={faDonate} size="lg"/>
      <Dollars wei={value}/>
    </span>
  );
}, "value");

const CommentarySummary = DerivedStateHOC(
  ConditionalHOC(({summary}) => {
    return (
      <span>
        <Tip value={summary.tip}/>
        <Vote value={summary.vote}/>
        <Flagged value={summary.flagged}/>
      </span>
    );
  }, "summary"),
  {
    summary: props => {
      const {commentary} = props;
      return toSummary(commentary);
    }
  }
);

export default CommentarySummary;
