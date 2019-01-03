import _ from "lodash";
import localForage from "localforage";

import { Buffer } from "buffer/";

import ipfs from "../utils/ipfs-infura";

import Model from "./Model";
import ContractHelper from "./ContractHelper";

import StringUtils from "../utils/StringUtils";
import ClassUtils from "../utils/ClassUtils";
import Multihash from "../utils/multihash";

const RecentTweetsKey = "recent-tweets";
const RecentTweetsToPersist = 50;

const MyPostsKey = "my-posts";

class PostService {
  constructor(account, contract, web3) {
    this.account = account;
    this.contract = contract;
    this.web3 = web3;
    this.handlers = [];

    this.txParams = {
      from: account
    };

    ClassUtils.bindAllMethods(PostService.prototype, this);

    this.contract.NewActionEvent(this.handleActionEvent);
  }

  async handleActionEvent(error, result) {
    // console.log("handleActionEvent", result);
    if (!error) {
      return await this.delegateToHandlers(result, this.handlers);
    } else {
      console.error("handleActionEvent", error);
    }
  }

  async delegateToHandlers(result, handlers) {
    // console.log("delegateToHandlers", result);
    const { targetId, targetType } = result.returnValues;

    switch (parseInt(targetType)) {
      case Model.ActionType.POST:
        const post = await this.getPostById(parseInt(targetId));
        return await this.handlePost(post, handlers);
      default:
        return null;
    }
  }

  async handlePost(post, handlers) {
    // console.log("handlePost", post);
    if (!_.isNil(post)) {
      if (this.isMyAccount(post.poster)) {
        const posts = await this.loadMyPosts();
        const newPosts = [post].concat(posts);
        await localForage.setItem(MyPostsKey, newPosts);
      } else {
        const posts = await this.loadRecentPosts();
        const newPosts = [post].concat(posts).splice(0, RecentTweetsToPersist);
        await localForage.setItem(RecentTweetsKey, newPosts);
      }
    }

    handlers.forEach(handler => {
      handler(post);
    });
  }

  txPaymentParams(to, amount) {
    return _.assign({}, this.txParams, {
      to: to,
      value: amount
    });
  }

  setActiveAccount(account) {
    this.account = account;
  }

  async loadRecentPosts() {
    const posts = await localForage.getItem(RecentTweetsKey);
    return _.compact(posts);
  }

  async loadMyPosts() {
    const posts = await localForage.getItem(MyPostsKey);
    return _.compact(posts);
  }

  async getPinnedPost() {
    const pinnedId = await this.contract.getPinnedPost(this.txParams);
    const id = ContractHelper.normalizeUint(pinnedId);
    return id;
  }

  async loadPinnedPost() {
    const pinnedId = await this.getPinnedPost();
    if (ContractHelper.isNullUint(pinnedId)) {
      return null;
    } else {
      return this.getPostById(pinnedId);
    }
  }

  async pinPost(postId) {
    return await this.contract.pinPost(postId, this.txParams);
  }

  async unpin() {
    return await this.contract.unpin(this.txParams);
  }

  async addUpvote(postId) {
    return await this.contract.addUpvote(postId, this.txParams);
  }

  async addDownvote(postId) {
    return await this.contract.addDownvote(postId, this.txParams);
  }

  async addFlag(postId) {
    return await this.contract.addFlag(postId, this.txParams);
  }

  async addTip(postId, ether) {
    const wei = this.web3.utils.toWei(
      Number(ether.toString()).toFixed(18),
      "ether"
    );
    const post = await this.getPostById(postId);
    return await this.contract.addTip(
      postId,
      this.txPaymentParams(post.poster, wei)
    );
  }

  async getCommentary(postId) {
    // console.log("getCommentary", postId);
    try {
      const count = await this.contract.getCommentaryCount(postId);
      return await Promise.all(
        _.map(
          _.range(count),
          async i => await this.contract.getCommentary(postId, i)
        )
      );
    } catch (e) {
      return [];
    }
  }

  async hasMyCommentary(postId) {
    const commentary = await this.getCommentary(postId);
    return _.some(commentary, c => this.isMyAccount(c.commenter));
  }

  async isPostFlagged(postId) {
    const commentary = await this.getCommentary(postId);
    return _.some(
      commentary,
      c => parseInt(c.commentaryType.toString()) === Model.CommentaryType.FLAG
    );
  }

  async getPostById(postId) {
    const postData = await this.contract.getPost(postId);
    if (_.isEmpty(postData.poster)) {
      return null;
    } else {
      const post = new Model.Post.fromPermaChatContract(
        _.assign({}, postData, { postId: postId })
      );
      return post;
    }
  }

  async registerNewPostHandler(handler) {
    this.handlers = this.handlers.concat([handler]);
  }

  async unregisterNewPostHandler(handler) {
    this.handlers = this.handlers.filter(h => h !== handler);
  }

  async addPostFromContent(content, tags, contentType) {
    const value = content + StringUtils.mkString(tags, " ", "\n\n", "");
    try {
      const ipfsHash = await ipfs.add(Buffer.from(value));
      const { hash } = ipfsHash[0];
      const multihash = Multihash.getBytes32FromMultiash(hash);
      const result = await this.contract.newPost(
        multihash.digest,
        multihash.hashFunction,
        multihash.size,
        contentType || Model.ContentType.TEXT,
        this.txParams
      );

      return result;
    } catch (error) {
      console.error("error", error);
    }
  }

  async addReplyFromContent(parentPostId, content, tags, contentType) {
    const value = content + StringUtils.mkString(tags, " ", "\n\n", "");
    try {
      const ipfsHash = await ipfs.add(Buffer.from(value));
      const { hash } = ipfsHash[0];
      const multihash = Multihash.getBytes32FromMultiash(hash);
      const result = await this.contract.newReply(
        parentPostId,
        multihash.digest,
        multihash.hashFunction,
        multihash.size,
        contentType || Model.ContentType.TEXT,
        this.txParams
      );

      return result;
    } catch (error) {
      console.error("error", error);
    }
  }

  isMyAccount(account) {
    return account === this.account;
  }

  getReplyIds(postId) {
    return this.contract
      .getReplies(postId)
      .catch(error => [])
      .then(ids => _.compact(_.map(ids, ContractHelper.normalizeUint)));
  }

  getReplyParentId(postId) {
    return this.contract
      .getReplyParent(postId)
      .catch(error => 0)
      .then(ContractHelper.normalizeUint);
  }
}

export default PostService;
