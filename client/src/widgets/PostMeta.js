import _ from "lodash";
import React from "react";
import {connect} from "react-redux";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDatabase} from "@fortawesome/free-solid-svg-icons";
import {faEthereum} from "@fortawesome/free-brands-svg-icons";

import UserLink from "./UserLink";
import CommentarySummary from "./CommentarySummary";
import ExternalAnchor from "./ExternalAnchor";
import Timestamp from "./Timestamp";

import ConditionalHOC from "../hoc/ConditionalHOC";
import DerivedStateHOC from "../hoc/DerivedStateHOC";
import LoadingHOC from "../hoc/LoadingHOC";
import InitializeHOC from "../hoc/InitializeHOC";

import * as Actions from "../state/actions";

const ConditionalUserLink = ConditionalHOC(
  connect(
    (state, ownProps) => {
      const {identityProvidersMapping} = state;
      return {
        providers: _.get(identityProvidersMapping, [ownProps.address])
      };
    },
    (dispatch, ownProps) => {
      return {
        fetchIdentityProviders: () => {
          dispatch(Actions.fetchIdentityProviders(ownProps.address));
        }
      };
    }
  )(InitializeHOC(props => props.fetchIdentityProviders(), LoadingHOC(["providers"], UserLink)))
);

const PostMeta = DerivedStateHOC(
  props => {
    const {mine} = props;
    const {id, poster, timestamp, blockNumber, hash} = props.post;
    const ipfsUri = "https://ipfs.infura.io/ipfs/" + hash;
    const ethereumUri = "http://127.0.0.1:7545/block/" + blockNumber;
    return (
      <div>
        <div className="text-muted">
          <span title={"post id: " + id}>
            <Timestamp timestamp={timestamp}/>
          </span>
          <ExternalAnchor
            href={ipfsUri}
            title={"IPFS: " + hash}
            className="text-muted ml-2"
          >
            <FontAwesomeIcon icon={faDatabase}/>
          </ExternalAnchor>
          <ExternalAnchor
            href={ethereumUri}
            title={"BLOCK: " + blockNumber}
            className="text-muted ml-2"
          >
            <FontAwesomeIcon icon={faEthereum}/>
          </ExternalAnchor>
        </div>
        <div>
          <ConditionalUserLink
            services={props.services}
            address={poster}
            show={!mine}
          />
        </div>
        <div>
          <CommentarySummary
            commentary={props.commentary}
            convertWeiToDollars={props.services.convertWeiToDollars}
          />
        </div>
      </div>
    );
  },
  {
    commentary: props => {
      return props.services.getCommentary(props.post.id);
    }
  }
);

export default PostMeta;
