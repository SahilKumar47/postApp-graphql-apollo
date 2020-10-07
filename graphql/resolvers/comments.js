const { UserInputError, AuthenticationError } = require("apollo-server");

const Post = require("../../models/Posts");
const checkauth = require("../../utils/checkauth");

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { username } = checkauth(context);
      if (body.trim() === "")
        throw new UserInputError("Comment cannot be empty", {
          errors: {
            body: "Comment body must not be empty",
          },
        });
      const post = await Post.findById(postId);
      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      } else throw new UserInputError("Post not found");
    },
    deleteComment: async (_, { postId, commentId }, context) => {
      const { username } = checkauth(context);
      const post = await Post.findById(postId);
      if (post) {
        const commentIndex = post.comments.findIndex((c) => c.id === commentId);

        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
};
