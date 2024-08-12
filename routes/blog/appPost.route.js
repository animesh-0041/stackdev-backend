const express = require("express");
const { auth } = require("../../middlewares/auth.middlewares");
const { PostModel } = require("../../models/post.model");
const { UserModel } = require("../../models/users.model");
const { httpStatus } = require("../../config/lib/statusCode");
const { LikeModel } = require("../../models/postLike.model");
const { conditionalAuth } = require("../../helpers/conditionalAuth");
const { createNotification } = require("../../helpers/saveNotification");
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
    const newNotification = {
      creator: userId,
      url: `/${newPost?.username}/${newPost?.url}`,
      body: `A new blog post has been published by ${newPost?.createdBy}🥳. Check it out now!`,
      title: `A New Post is created by ${newPost?.createdBy}`,
    };

    await createNotification(newNotification);
    res.status(httpStatus.CREATED).json({ message: "Post created" });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Error creating post", error });
  }
});
// Add a route to fetch all posts
postRouter.get("/allposts", async (req, res) => {
  const { userId } = req.body;
  const { page = 1, limit = 20 } = req.query;

  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  if (isNaN(pageNumber) || pageNumber < 1 || isNaN(pageSize) || pageSize < 1) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ error: "Invalid pagination parameters" });
  }
  try {
    const posts = await PostModel.aggregate([
      // {
      //   $sort: { createdAt: -1 },
      // },
      {
        $sample: { size: Number.MAX_SAFE_INTEGER },
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
          "user.name": 1,
          "user.photoURL": 1,
          "user._id": 1,
          "user.username": 1,
          blogHeader: 1,
          likes: 1,
          view: 1,
          url: 1,
        },
      },
      {
        $skip: (pageNumber - 1) * pageSize,
      },
      {
        $limit: pageSize,
      },
    ]);

    return res.status(httpStatus.OK).json(posts);
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
      {
        $project: {
          _id: 1,
          content: 1,
          tag: 1,
          createdBy: 1,
          bookmarkedBy: 1,
          userId: 1,
          username: 1,
          likes: 1,
          view: 1,
          url: 1,
          "userDetails._id": 1,
          "userDetails.name": 1,
          "userDetails.username": 1,
          "userDetails.photoURL": 1,
        },
      },
    ]);
    if (!post || post.length === 0) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Post not found" });
    }
    await PostModel.updateOne({ url }, { $inc: { view: 1 } });
    post = { ...post[0], userDetails: post[0].userDetails[0] };

    // Check if user has liked the post
    let isLikeByUser = false;
    if (userId && post.likes && post.likes.hasOwnProperty(userId)) {
      isLikeByUser = true;
    }

    // Check if the post is bookmarked by the user
    let isBookmarkedByUser = false;
    if (
      userId &&
      post.bookmarkedBy &&
      post.bookmarkedBy.hasOwnProperty(userId)
    ) {
      isBookmarkedByUser = true;
    }
    // some additional properties to the post
    const updatedPost = {
      ...post,
      likes: undefined,
      isLikeByUser,
      isBookmarkedByUser,
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
  const { q, type } = req.query;

  try {
    switch (type) {
      case "stories":
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
              "blogHeader.image.data.file.url": 1,
              createdBy: 1,
              createdAt: 1,
              url: 1,
              tag: 1,
              userDetails: 1,
              view: 1,
            },
          },
        ]);

        if (posts.length === 0) {
          return res.status(httpStatus.OK).json({ msg: "No search result" });
        }

        return res.status(httpStatus.OK).json({ data: posts });
      case "people":
        const users = await UserModel.find({
          $or: [
            { name: { $regex: q, $options: "i" } },
            { userName: { $regex: q, $options: "i" } },
          ],
        });

        if (users.length === 0) {
          return res.status(httpStatus.OK).json({ msg: "No search result" });
        }

        return res.status(httpStatus.OK).json({ data: users });
      default:
        return res.status(httpStatus.OK).json({ msg: "No search result" });
    }
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch blog posts" });
  }
});

// delete post
postRouter.delete("/delete/:url", auth, async (req, res) => {
  const { url } = req.params;
  try {
    await PostModel.deleteOne({ url });
    return res
      .status(httpStatus.OK)
      .json({ message: "Post deleted successfully" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to delete post" });
  }
});

// update post
postRouter.patch("/update/:url", auth, async (req, res) => {
  const { url } = req.params;
  try {
    await PostModel.updateOne({ url }, { $set: { ...req.body } });
    return res
      .status(httpStatus.OK)
      .json({ message: "Post updated successfully" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to update post" });
  }
});

// remove blog from bookmark
postRouter.delete("/bookmark/:url", auth, async (req, res) => {
  const { userId } = req.body;
  const { url } = req.params;

  try {
    const post = await PostModel.findOne({ url });
    if (!post) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Post not found" });
    }
    const userIdStr = userId.toString();
    const userHasBookmarked = post.bookmarkedBy.has(userIdStr);

    if (!userHasBookmarked) {
      return res
        .status(httpStatus.OK)
        .json({ message: "Post is not bookmarked" });
    }

    post.bookmarkedBy.delete(userIdStr);
    await post.save();
    return res
      .status(httpStatus.OK)
      .json({ message: "Post unbookmarked successfully" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to remove bookmark from post" });
  }
});

// bookmark a blog
postRouter.post("/bookmark/:url", auth, async (req, res) => {
  const { userId } = req.body;
  const { url } = req.params;
  try {
    const post = await PostModel.findOne({ url });
    if (!post) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Post not found" });
    }
    const userIdStr = userId.toString();
    const userHasBookmarked = post.bookmarkedBy.has(userIdStr);
    if (userHasBookmarked) {
      return res
        .status(httpStatus.OK)
        .json({ message: "Post is already bookmarked" });
    }
    post.bookmarkedBy.set(userIdStr, new Date());
    await post.save();
    return res
      .status(httpStatus.OK)
      .json({ message: "Post bookmarked successfully" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to bookmark post" });
  }
});

// bookmarks data by user id
postRouter.get("/bookmark-blogs", auth, async (req, res) => {
  const { userId } = req.body;
  try {
    const bookmarkedBlogs = await PostModel.aggregate([
      {
        $match: {
          [`bookmarkedBy.${userId}`]: { $exists: true },
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
          "user.username": 1,
          blogHeader: 1,
          view: 1,
          url: 1,
        },
      },
    ]);
    return res.status(httpStatus.OK).json(bookmarkedBlogs);
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch bookmarks data" });
  }
});

// recommended posts
postRouter.get("/recommended-blogs", async (req, res) => {
  try {
    const recommendedPosts = await PostModel.aggregate([
      {
        $sample: { size: 3 },
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
          "user.username": 1,
          blogHeader: 1,
          view: 1,
          url: 1,
        },
      },
    ]);
    return res.status(httpStatus.OK).json(recommendedPosts);
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to fetch recommended posts" });
  }
});

module.exports = { postRouter };
