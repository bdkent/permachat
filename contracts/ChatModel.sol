pragma solidity >=0.5.0 <0.6.0;

import "./CommonModel.sol";

contract ChatModel is CommonModel {
  
  enum ContentType { TEXT, MARKDOWN, ASCII_DOC, RE_STRUCTURED_TEXT, LATEX }
  
  struct Post {
    uint postId;
    Multihash multihash;
    address payable poster;
    uint blockNumber;
    uint timestamp;
    ContentType contentType;
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
    
  function toIdentityId(address identityAddress) internal view returns ( uint );
  
  modifier isValidPost(uint postId) { require (postId < nextPostIndex); _; }
  
  modifier isValidComment(uint commentId) { require (commentId < nextCommentIndex); _; }
  
  modifier isValidCommentIndex(uint postId, uint commentIndex) { require (postToCommentaryContent[postId].length < commentIndex); _; }
  
  modifier hasNotYetCommented(uint postId) { require (!commented[postId][toIdentityId(msg.sender)]); _; }
}
