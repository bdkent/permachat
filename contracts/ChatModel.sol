pragma solidity >=0.5.0 <0.6.0;

import "./CommonModel.sol";

contract ChatModel is CommonModel {
  
  struct Post {
    uint postId;
    string ipfsHash;
    address payable poster;
    uint blockNumber;
    uint timestamp;
    string contentType; // ie: txt, md
  }
  
  uint public nextPostIndex = 1;
  mapping(uint => Post) posts;
  
  mapping(uint => uint[]) postToReplies;
  mapping(uint => uint) replyToParentPost;
  
  mapping(address => uint) pinnedPosts;
  
  enum CommentaryType { TIP, UPVOTE, DOWNVOTE, FLAG }
  
  struct Commentary {
    CommentaryType commentaryType;
    address commenter;
    uint timestamp;
    uint tip;
  }
  
  // postId => comments
  mapping(uint => Commentary[]) postToCommentaryContent; 

  // postId => identityId => state
  mapping(uint => mapping(uint => bool)) commented; 

  // commentId => comment
  uint public nextCommentIndex = 1;
  mapping(uint => Commentary) comments;
  
  event NewPostEvent(
    uint postId,
    string ipfsHash,
    address poster,
    uint blockNumber,
    uint timestamp,
    string contentType
  );
  
  event NewReplyEvent(
    uint parentPostId,
    uint postId,
    string ipfsHash,
    address poster,
    uint blockNumber,
    uint timestamp,
    string contentType
  );
  
  event NewCommentaryEvent(
    uint postId,
    uint commentaryIndex,
    uint commentId,
    CommentaryType commentaryType,
    address commenter,
    uint timestamp,
    uint tip
  );
  
  function toIdentityId(address identityAddress) internal view returns ( uint );
  
  modifier isValidPost(uint postId) { require (postId < nextPostIndex); _; }
  
  modifier isValidComment(uint commentId) { require (commentId < nextCommentIndex); _; }
  
  modifier isValidCommentIndex(uint postId, uint commentIndex) { require (postToCommentaryContent[postId].length < commentIndex); _; }
  
  modifier hasNotYetCommented(uint postId) { require (!commented[postId][toIdentityId(msg.sender)]); _; }
  
  
}
