const express = require("express");
const mongoose = require("mongoose");
const { auth } = require("../../middlewares/auth.middlewares");
const { httpStatus } = require("../../config/lib/statusCode");
const { commentModel } = require("../../models/coments.model");
const { UserModel } = require("../../models/users.model");
const { conditionalAuth } = require("../../helpers/conditionalAuth");
const commentRouter = express.Router();
// comment post
commentRouter.post("/comment/:postId", auth, async (req, res) => {
  const { postId } = req.params;

  try {
    const comment = new commentModel({
      ...req.body,
      postId,
      user: req.body.name,
      createdAt: new Date(),
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
  try {
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
    ]);

    return res.status(httpStatus.OK).json(comments);
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error });
  }
});

module.exports = { commentRouter };
