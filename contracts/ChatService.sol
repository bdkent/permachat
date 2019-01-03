pragma solidity >=0.5.0 <0.6.0;

import "./ChatModel.sol";
import "./ActionModel.sol";
import "./IdentityModel.sol";

contract ChatService is ChatModel, ActionModel, IdentityModel {
  
  function newBasePost(string memory ipfsHash, ContentType contentType) internal returns (uint postId) {
    uint newPostId = nextPostIndex;
    posts[newPostId] = Post({
      postId: newPostId,
      ipfsHash: ipfsHash,
      poster: msg.sender,
      blockNumber: block.number,
      timestamp: block.timestamp * 1000,
      contentType: contentType
    });
    nextPostIndex += 1;
    return newPostId;
  }
  
  function newPost(string memory ipfsHash, ContentType contentType) public hasIdentity() returns (uint postId) {
    uint newPostId = newBasePost(ipfsHash, contentType);
    addAction(newPostId, TargetType.POST);
    emit NewPostEvent({
      postId: posts[newPostId].postId,
      ipfsHash: posts[newPostId].ipfsHash,
      poster: posts[newPostId].poster,
      blockNumber: posts[newPostId].blockNumber,
      timestamp: posts[newPostId].timestamp,
      contentType: contentType
    });
    return newPostId;
  }
  
  function newReply(uint parentPostId, string memory ipfsHash, ContentType contentType) public hasIdentity() isValidPost(parentPostId) returns (uint) {
    uint newReplyId = newBasePost(ipfsHash, contentType);
    postToReplies[parentPostId].push(newReplyId);
    replyToParentPost[newReplyId] = parentPostId;
    addAction(newReplyId, TargetType.REPLY);
    emit NewReplyEvent({
      parentPostId: parentPostId,
      postId: posts[newReplyId].postId,
      ipfsHash: posts[newReplyId].ipfsHash,
      poster: posts[newReplyId].poster,
      blockNumber: posts[newReplyId].blockNumber,
      timestamp: posts[newReplyId].timestamp,
      contentType: contentType
    });
    return newReplyId;
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
    uint commentaryIndex = postToCommentaryContent[postId].length;
    uint timestamp = block.timestamp * 1000;
    commented[postId][toIdentityId(msg.sender)] = true;
    Commentary memory commentary = Commentary({
      commentaryType: commentaryType,
      commenter: msg.sender,
      timestamp: timestamp,
      tip: tip
    });
    postToCommentaryContent[postId].push(commentary);
    comments[newCommentId] = commentary;
    
    addAction(newCommentId, TargetType.COMMENT);
    nextCommentIndex += 1;
    
    emit NewCommentaryEvent({
      postId: postId,
      commentaryIndex: commentaryIndex,
      commentId: newCommentId,
      commentaryType: commentaryType,
      commenter: msg.sender,
      timestamp: timestamp,
      tip: tip
    });
  }
}
