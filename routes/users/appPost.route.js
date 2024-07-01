const express = require("express");
const { auth } = require("../../middlewares/auth.middlewares");
const { PostModel } = require("../../models/post.model");
const { httpStatus } = require("../../config/lib/statusCode");
const { LikeModel } = require("../../models/postLike.model");
const postRouter = express.Router();

// create a post
postRouter.post("/create", auth, async (req, res) => {
  try {
    const newPost = new PostModel({
      ...req.body,
      createdBy: req.body.name,
    });
    await newPost.save();
    res.status(httpStatus.CREATED).json({ newPost });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});
// Add a route to fetch all posts
postRouter.get("/",  async (req, res) => {
  const { userId } = req.body;

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
          content: 1,
          tag: 1,
          createdAt: 1,
          likes: 1,
          "user.name": 1,
          "user.photoURL": 1,
          blogHeader: 1,
          view: 1,
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


//Individual post
postRouter.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Post not found" });
    }
    res.status(httpStatus.OK).json({ post });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch post" });
  }
});

module.exports = { postRouter };
