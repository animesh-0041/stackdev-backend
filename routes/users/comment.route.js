const express = require("express");
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
  try {
    const comments = await commentModel.aggregate([
      { $match: { postId: postId, parentCommentId: null } },
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
      
    ]);

    return res.status(httpStatus.OK).json(comments);
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error", error });
  }

  // try {
  //   let comments = [];

  //   if (commentId) {
  //     // Fetch nested comments for the given commentId
  //     comments = await commentModel.find({
  //       parentCommentId: commentId,
  //     });
  //   } else if (postId) {
  //     // Fetch top-level comments for the given postId
  //     comments = await commentModel.find({
  //       postId,
  //       parentCommentId: null,
  //     });
  //   } else {
  //     return res
  //       .status(httpStatus.BAD_REQUEST)
  //       .json({ message: "postId or commentId is required" });
  //   }

  //   // Create an array of promises to check for child comments and count them
  //   const commentsWithChildCountPromises = comments.map(async (comment) => {
  //     const childCommentCount = await commentModel.countDocuments({
  //       parentCommentId: comment._id,
  //     });
  //     return {
  //       ...comment.toObject(),
  //       isTopLevelComment: childCommentCount === 0,
  //       childCommentCount,
  //     };
  //   });

  //   const commentsWithChildCount = await Promise.all(
  //     commentsWithChildCountPromises
  //   );

  //   res.status(httpStatus.OK).json(commentsWithChildCount);
  // } catch (error) {
  //   console.error("Error fetching comments:", error);
  //   res
  //     .status(httpStatus.INTERNAL_SERVER_ERROR)
  //     .json({ message: "Internal server error" });
  // }
});

module.exports = { commentRouter };

// for (const comment of comments) {
//   var childComments = await commentModel.countDocuments({ parentCommentId: comment._id });
// }

// console.log("Comments with child counts:", childComments);
