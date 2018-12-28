class Post {
  constructor(id, hash, poster, blockNumber, timestamp, contentType) {
    this.id = id;
    this.hash = hash;
    this.poster = poster;
    this.blockNumber = blockNumber;
    this.timestamp = timestamp;
    this.contentType = contentType || "txt";
  }
}

Post.fromPermaChatContract = returnValues => {
  const {
    postId,
    ipfsHash,
    poster,
    blockNumber,
    timestamp,
    contentType
  } = returnValues;

  return new Post(
    postId,
    ipfsHash,
    poster,
    blockNumber,
    timestamp,
    contentType
  );
};

const CommentaryType = {
  TIP: 0,
  UPVOTE: 1,
  DOWNVOTE: 2,
  FLAG: 3
};

const Model = {
  Post: Post,
  CommentaryType: CommentaryType
};

export default Model;
