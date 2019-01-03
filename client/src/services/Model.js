const ContentType = {
  TEXT: 0,
  MARKDOWN: 1,
  ASCII_DOC: 2,
  RE_STRUCTURED_TEXT: 3,
  LATEX: 4
};

class Post {
  constructor(id, hash, poster, blockNumber, timestamp, contentType) {
    this.id = id;
    this.hash = hash;
    this.poster = poster;
    this.blockNumber = blockNumber;
    this.timestamp = timestamp;
    this.contentType = contentType || ContentType.TEXT;
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

const ActionType = {
  POST: 0,
  REPLY: 1,
  COMMENT: 2
};

const Model = {
  Post: Post,
  CommentaryType: CommentaryType,
  ActionType: ActionType,
  ContentType: ContentType
};

export default Model;
