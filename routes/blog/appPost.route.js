const express = require("express");
const { auth } = require("../../middlewares/auth.middlewares");
const { PostModel } = require("../../models/post.model");
const { UserModel } = require("../../models/users.model");
const { httpStatus } = require("../../config/lib/statusCode");
const { LikeModel } = require("../../models/postLike.model");
const { conditionalAuth } = require("../../helpers/conditionalAuth");
const postRouter = express.Router();

// create a post
postRouter.post("/create", auth, async (req, res) => {
  const { userId } = req.body;
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
postRouter.get("/allposts", async (req, res) => {
  const { userId } = req.body;

  try {
    const posts = await PostModel.aggregate([
      {
        $sort: { createdAt: -1 },
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
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          tag: 1,
          createdAt: 1,
          likes: 1,
          "user.name": 1,
          "user.photoURL": 1,
          "user._id": 1,
          "user.userName": 1,
          blogHeader: 1,
          view: 1,
          url: 1,
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
postRouter.get("/individual/:url", conditionalAuth, async (req, res) => {
  const { url } = req.params;
  const { userId } = req.body;
  try {
    let post = await PostModel.aggregate([
      { $match: { url } },
      { $project: { blogHeader: 0 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
    ]);
    if (!post || post.length === 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Post not found" });
    }
    post = { ...post[0], userDetails: post[0].userDetails[0] };
    let isLikeByUser = false;
    if (userId && post.likes && post.likes.hasOwnProperty(userId))
      isLikeByUser = true;
    const updatedPost = {
      ...post,
      likes: undefined,
      isLikeByUser,
    };
    return res.status(httpStatus.OK).json(updatedPost);
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch post" });
  }
});

//search post
postRouter.get("/search/", async (req, res) => {
  const { q } = req.query;

  try {
    const posts = await PostModel.aggregate([
      {
        $match: {
          $or: [
            { createdBy: { $regex: q, $options: "i" } },
            { tag: { $elemMatch: { $regex: q, $options: "i" } } },
            {
              content: {
                $elemMatch: {
                  $or: [
                    { "data.text": { $regex: q, $options: "i" } },
                    { "data.caption": { $regex: q, $options: "i" } },
                    { "data.code": { $regex: q, $options: "i" } },
                    { "data.html": { $regex: q, $options: "i" } },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $project: {
          "blogHeader.header.data.text": 1,
          "blogHeader.paragraph.data.text": 1,
          "blogHeader.image.data.url": 1,
          createdBy: 1,
          createdAt: 1,
          url: 1,
          tag: 1,
          userDetails: 1,
        },
      },
    ]);

    const users = await UserModel.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { userName: { $regex: q, $options: "i" } },
      ],
    });

    if (posts.length === 0 && users.length === 0) {
      return res.status(httpStatus.OK).json({ msg: "No search result" });
    }

    res.status(httpStatus.OK).json({ posts: posts, users: users });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch blog posts" });
  }
});

module.exports = { postRouter };
