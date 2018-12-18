pragma solidity >=0.4.22 <0.6.0;

import "./IdentityRegistry.sol";

contract PermaChat is IdentityRegistry {
  
  struct Post {
    uint postId;
    string ipfsHash;
    address poster; /* eventually IdentityId */
    uint blockNumber;
    uint timestamp;
    string contentType; // ie: txt, md
  }
  
  uint public nextPostIndex = 1;
  mapping(uint => Post) posts;
  
  mapping(uint => uint[]) postToReplies;
  mapping(uint => uint) replyToParentPost;
  
  /* eventually IdentityId */
  mapping(address => uint) pinnedPosts;
  
  enum CommentaryType { TIP, UPVOTE, DOWNVOTE, FLAG }
  
  struct Commentary {
    CommentaryType commentaryType;
    /* eventually IdentityId */
    address commenter;
    uint timestamp;
    uint tip;
  }
  
  mapping(uint => Commentary[]) postToCommentaryContent;
  mapping(uint => mapping(address => bool)) commented;
  
  event NewPostEvent(
    uint currentDatabaseIndex, // TODO: remove event broken into different contracts
    uint postId,
    string ipfsHash,
    address poster,
    uint blockNumber,
    uint timestamp,
    string contentType
  );
  
  event NewReplyEvent(
    uint currentDatabaseIndex, // TODO: remove event broken into different contracts
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
    CommentaryType commentaryType,
    address commenter,
    uint timestamp,
    uint tip
  );
  
  modifier isValidPost(uint postId) { require (postId < nextPostIndex); _; }

  function getCommentaryCount(uint postId) public view isValidPost(postId) returns (uint commentaryCount) {
    // require (postId < nextPostIndex);
    return postToCommentaryContent[postId].length;
  }
  
  function getCommentary(uint postId, uint commentaryIndex) public view isValidPost(postId) returns (CommentaryType commentaryType, address commenter, uint timestamp, uint tip) {
    require (commentaryIndex < postToCommentaryContent[postId].length);
    return (postToCommentaryContent[postId][commentaryIndex].commentaryType, postToCommentaryContent[postId][commentaryIndex].commenter, postToCommentaryContent[postId][commentaryIndex].timestamp, postToCommentaryContent[postId][commentaryIndex].tip);
  }
  
  function getPost(uint postId) public view isValidPost(postId) returns (string ipfsHash, address poster, uint blockNumber, uint timestamp, string contentType) {
    return (posts[postId].ipfsHash, posts[postId].poster, posts[postId].blockNumber, posts[postId].timestamp, posts[postId].contentType);
  }
  
  function getReplies(uint postId) public view isValidPost(postId) returns (uint[] replyIds) {
    return postToReplies[postId];
  }
  
  function getReplyParent(uint replyId) public view isValidPost(replyId) returns (uint parentPostId) {
    return replyToParentPost[replyId];
  }
  
  function newPost(string ipfsHash, string contentType) public returns (uint postId) {
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
    emit NewPostEvent({
      currentDatabaseIndex: latestDatabaseIndex,
      postId: posts[newPostId].postId,
      ipfsHash: posts[newPostId].ipfsHash,
      poster: posts[newPostId].poster,
      blockNumber: posts[newPostId].blockNumber,
      timestamp: posts[newPostId].timestamp,
      contentType: contentType
    });
    return newPostId;
  }
  
  function newReply (uint parentPostId, string ipfsHash, string contentType) public isValidPost(parentPostId) returns (uint) {
    uint newReplyId = newPost(ipfsHash, contentType);
    postToReplies[parentPostId].push(newReplyId);
    replyToParentPost[newReplyId] = parentPostId;
    emit NewReplyEvent({
      currentDatabaseIndex: latestDatabaseIndex,
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
  
  function getPinnedPost() public view returns (uint) {
    return pinnedPosts[msg.sender];
  }
  
  function pinPost(uint postId) public isValidPost(postId) {
    require(posts[postId].poster == msg.sender);
    pinnedPosts[msg.sender] = postId;
  }
  
  function unpin() public {
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
  
  function hasCommented(uint postId) public view isValidPost(postId) returns (bool) {
    return commented[postId][msg.sender];
  }
  
  function addCommentary(uint postId, CommentaryType commentaryType, uint tip) private isValidPost(postId) {
    require (!commented[postId][msg.sender]);
    uint commentaryIndex = postToCommentaryContent[postId].length;
    uint timestamp = block.timestamp * 1000;
    commented[postId][msg.sender] = true;
    postToCommentaryContent[postId].push(Commentary({
      commentaryType: commentaryType,
      commenter: msg.sender,
      timestamp: timestamp,
      tip: tip
    }));
    
    emit NewCommentaryEvent({
      postId: postId,
      commentaryIndex: commentaryIndex,
      commentaryType: commentaryType,
      commenter: msg.sender,
      timestamp: timestamp,
      tip: tip
    });
  }

  // ORACLE:
  address oracle;
    
  constructor() public {
    oracle = msg.sender;
  }
  
  modifier isOracle { require(oracle == msg.sender); _; }
  
  // DB MANAGEMENT:
  
  uint public latestDatabaseIndex = 0;
  mapping(uint => string) datebaseHashes;  

  event DBUpdateEvent(uint currentDatabaseIndex);
  
  function setNewDB(string ipfsHash) public isOracle {
    latestDatabaseIndex += 1;
    datebaseHashes[latestDatabaseIndex] = ipfsHash;
    emit DBUpdateEvent(latestDatabaseIndex);
  }
  
  function getDB(uint currentDatabaseIndex) public view returns (string) {
    require(currentDatabaseIndex >= 0 &&  currentDatabaseIndex <= latestDatabaseIndex);
    return datebaseHashes[currentDatabaseIndex];
  }
  
  function getLatestDBIndex() public view returns (uint) {
    return latestDatabaseIndex;
  }
  
  function getLatestDBHash() public view returns (string) {
    return datebaseHashes[latestDatabaseIndex];
  }
  
  // IDENTITY MANAGEMENT:
}
