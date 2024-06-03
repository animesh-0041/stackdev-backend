const express = require("express");
const { auth } = require("../../middlewares/auth.middlewares");
const { PostModel } = require("../../models/post.model");
const { httpStatus } = require("../../config/lib/statusCode");
const { LikeModel } = require("../../models/postLike.model");
const postRouter = express.Router();

postRouter.post("/create", auth, async (req, res) => {
  try {
    const newPost = new PostModel({
      ...req.body,
      createdBy: req.body.displayName,
    });
    await newPost.save();
    res.status(httpStatus.CREATED).json({ newPost });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});
// Add a route to fetch all posts
postRouter.get("/posts", auth, async (req, res) => {
  const { userId } = req.body; // Ensure userId is obtained from query parameters

  try {
    const posts = await PostModel.aggregate([
      {
        $sort: { createdAt: -1 }, // Sort posts by creation date (newest first)
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "postId",
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId", // Assuming userId field in posts collection
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          title: 1,
          content: 1,
          category: 1,
          createdAt: 1,
          likes: 1,
          "user.displayName": 1,
          "user.photoURL": 1,
        },
      },
    ]);

    const transformedposts = posts.map((post) => {
      post.isUserLiked = post.likes.some(
        (like) => like.userId.toString() === userId
      );
      return post;
    });

    return res.status(httpStatus.OK).json(transformedposts);
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch posts" });
  }
});

module.exports = { postRouter };
