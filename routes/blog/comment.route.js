const express = require("express");
const mongoose = require("mongoose");
const { auth } = require("../../middlewares/auth.middlewares");
const { httpStatus } = require("../../config/lib/statusCode");
const { commentModel } = require("../../models/comments.model");
const { UserModel } = require("../../models/users.model");
const { conditionalAuth } = require("../../helpers/conditionalAuth");
const { NotificationModel } = require("../../models/notification.model");
const { mongoose } = require("mongoose");
const commentRouter = express.Router();
// comment post
commentRouter.post("/comment", auth, async (req, res) => {
  const { postId, userId } = req.body;

  try {
    const comment = new commentModel({
      ...req.body,
      postId,
      user: req.body.name,
      createdAt: new Date(),
    });
    const newNotification = new NotificationModel({
      creator: new mongoose.Schema.Types.ObjectId(userId),
      title: "New Comment on Your Post",
      body: `Someone commented on your post:post.title"`,
      targetUsers: [post.author._id],
      url: `/posts/${postId}`,
    });
    await comment.save();
    res
      .status(httpStatus.CREATED)
      .json({ message: "Comment created", comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

//get comment
commentRouter.get("/comments", conditionalAuth, async (req, res) => {
  const { postId, commentId } = req.query;
  let comments;
  if (!postId) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "postId is required" });
  }
  try {
    if (postId && commentId) {
      comments = await commentModel.aggregate([
        {
          $match: {
            postId: new mongoose.Types.ObjectId(postId),
            parentCommentId: new mongoose.Types.ObjectId(commentId),
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
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);
    } else {
      comments = await commentModel.aggregate([
        {
          $match: {
            postId: new mongoose.Types.ObjectId(postId),
            parentCommentId: null,
          },
        },
        {
          $lookup: {
            from: "comments",
            localField: "_id",
            foreignField: "parentCommentId",
            as: "replies",
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
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            repliesCount: { $size: "$replies" },
          },
        },
        {
          $project: {
            replies: 0,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);
    }
    return res.status(httpStatus.OK).json(comments);
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error });
  }
});

module.exports = { commentRouter };
