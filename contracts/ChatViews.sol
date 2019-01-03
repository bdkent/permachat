pragma solidity >=0.5.0 <0.6.0;

import "./ChatModel.sol";

contract ChatViews is ChatModel {
  
  function getCommentaryCount(uint postId) public view isValidPost(postId) returns (uint commentaryCount) {
    return postToCommentaryContent[postId].length;
  }
  
  function getCommentary(uint postId, uint commentaryIndex) public view isValidPost(postId) isValidCommentIndex(postId, commentaryIndex) returns (CommentaryType commentaryType, address commenter, uint timestamp, uint tip) {
    return getCommentary(postToCommentaryContent[postId][commentaryIndex]);
  }
  
  function getCommentary(uint commentId) public view isValidComment(commentId) returns (CommentaryType commentaryType, address commenter, uint timestamp, uint tip) {
    return getCommentary(comments[commentId]);
  }
  
  function getCommentary(Commentary memory commentary) internal pure returns (CommentaryType commentaryType, address commenter, uint timestamp, uint tip) {
    commentaryType = commentary.commentaryType;
    commenter = commentary.commenter;
    timestamp = commentary.timestamp;
    tip = commentary.tip;
  }
  
  function getPost(uint postId) public view isValidPost(postId) returns (bytes32 multihashDigest, uint8 multihashHashFunction, uint8 multihashSize, address poster, uint blockNumber, uint timestamp, ContentType contentType) {
    multihashDigest = posts[postId].multihash.digest;
    multihashHashFunction = posts[postId].multihash.hashFunction;
    multihashSize = posts[postId].multihash.size;
    poster = posts[postId].poster;
    blockNumber = posts[postId].blockNumber;
    timestamp = posts[postId].timestamp;
    contentType = posts[postId].contentType;
  }
  
  function getReplies(uint postId) public view isValidPost(postId) returns (uint[] memory replyIds) {
    return postToReplies[postId];
  }
  
  function getReplyParent(uint replyId) public view isValidPost(replyId) returns (uint parentPostId) {
    return replyToParentPost[replyId];
  }
  
  function getPinnedPost() public view returns (uint) {
    return pinnedPosts[msg.sender];
  }
    
  function hasCommented(uint postId) public view isValidPost(postId) returns (bool) {
    return commented[postId][toIdentityId(msg.sender)];
  }
}
