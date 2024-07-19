const express = require("express");
const { auth } = require("../../middlewares/auth.middlewares");
const { PostModel } = require("../../models/post.model");
const { httpStatus } = require("../../config/lib/statusCode");
const likeRouter = express.Router();

likeRouter.post("/like/:url", auth, async (req, res) => {
  const { userId } = req.body;
  const { url } = req.params;
  try {
    const post = await PostModel.findOne({ url });
    if (!post) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Post not found" });
    }

    // like/unlike
    if (post.likes.has(userId)) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, new Date());
    }

    await post.save();

    res
      .status(httpStatus.CREATED)
      .json({ message: "Post like status updated", post });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to update post like status" });
  }
});

module.exports = {
  likeRouter,
};
