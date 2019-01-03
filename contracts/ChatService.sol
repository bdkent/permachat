pragma solidity >=0.5.0 <0.6.0;

import "./ChatModel.sol";
import "./ActionModel.sol";
import "./IdentityModel.sol";

contract ChatService is ChatModel, ActionModel, IdentityModel {
  
  function newBasePost(Multihash memory multihash, ContentType contentType) internal returns (uint postId) {
    uint newPostId = nextPostIndex;
    posts[newPostId] = Post({
      postId: newPostId,
      multihash: multihash,
      poster: msg.sender,
      blockNumber: block.number,
      timestamp: block.timestamp * 1000,
      contentType: contentType
    });
    nextPostIndex += 1;
    return newPostId;
  }
  
  function newPost(bytes32 multihashDigest, uint8 multihashHashFunction, uint8 multihashSize, ContentType contentType) public hasIdentity() {
    Multihash memory multihash = Multihash({
      digest: multihashDigest,
      hashFunction: multihashHashFunction,
      size: multihashSize
    });
    uint newPostId = newBasePost(multihash, contentType);
    addAction(newPostId, TargetType.POST);
  }
  
  function newReply(uint parentPostId, bytes32 multihashDigest, uint8 multihashHashFunction, uint8 multihashSize, ContentType contentType) public hasIdentity() isValidPost(parentPostId) {
    Multihash memory multihash = Multihash({
      digest: multihashDigest,
      hashFunction: multihashHashFunction,
      size: multihashSize
    });
    uint newReplyId = newBasePost(multihash, contentType);
    postToReplies[parentPostId].push(newReplyId);
    replyToParentPost[newReplyId] = parentPostId;
    addAction(newReplyId, TargetType.REPLY);
  }
  
  function pinPost(uint postId) public isValidPost(postId) hasIdentity() {
    require(posts[postId].poster == msg.sender);
    pinnedPosts[msg.sender] = postId;
  }
  
  function unpin() public hasIdentity() {
    if(pinnedPosts[msg.sender] > 0) {
      delete pinnedPosts[msg.sender];
    }
  }
  
  function addTip(uint postId) public payable {
    addCommentary(postId, CommentaryType.TIP, msg.value);
    posts[postId].poster.transfer(msg.value);
  }
  
  function addUpvote(uint postId) public {
    addCommentary(postId, CommentaryType.UPVOTE, 0);
  }
  
  function addDownvote(uint postId) public {
    addCommentary(postId, CommentaryType.DOWNVOTE, 0);
  }
  
  function addFlag(uint postId) public {
    addCommentary(postId, CommentaryType.FLAG, 0);
  }
  
  function addCommentary(uint postId, CommentaryType commentaryType, uint tip) private hasIdentity() isValidPost(postId) hasNotYetCommented(postId) {
    uint newCommentId = nextCommentIndex;
    postToCommentaryContent[postId].length;
    commented[postId][toIdentityId(msg.sender)] = true;
    Commentary memory commentary = Commentary({
      commentaryType: commentaryType,
      commenter: msg.sender,
      timestamp: block.timestamp * 1000,
      tip: tip
    });
    postToCommentaryContent[postId].push(commentary);
    comments[newCommentId] = commentary;
    
    addAction(newCommentId, TargetType.COMMENT);
    nextCommentIndex += 1;
  }
}
