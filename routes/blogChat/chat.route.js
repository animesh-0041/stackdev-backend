const express = require("express");
const { auth } = require("../../middlewares/auth.middlewares");
const { UserModel } = require("../../models/users.model");
const { httpStatus } = require("../../config/lib/statusCode");
const { mongoose } = require("mongoose");
const { MessageModel } = require("../../models/message.modal");

const chatRouter = express.Router();

// get friends  list
chatRouter.get("/friends-contact", auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const friends = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          followers: { $objectToArray: "$followers" },
          following: { $objectToArray: "$following" },
        },
      },
      {
        $project: {
          mutualFriends: {
            $filter: {
              input: "$following",
              as: "follow",
              cond: { $in: ["$$follow.k", "$followers.k"] },
            },
          },
        },
      },
      {
        $project: {
          friendIds: {
            $map: {
              input: "$mutualFriends",
              as: "mf",
              in: { $toObjectId: "$$mf.k" },
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "friendIds",
          foreignField: "_id",
          as: "friendDetails",
        },
      },
      {
        $project: {
          "friendDetails._id": 1,
          "friendDetails.username": 1,
          "friendDetails.name": 1,
          "friendDetails.photoURL": 1,
        },
      },
    ]);

    const friendsList = friends.length > 0 ? friends[0].friendDetails : [];
    res.status(httpStatus.OK).json(friendsList);
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to get friends" });
  }
});

// get chat history

chatRouter.get("/history", auth, async (req, res) => {
  const { userId } = req.body;
  const { friendId, page = 1, limit = 30 } = req.query;
  if (!userId || !friendId) {
    return res.status(400).send("Invalid user ID or friend ID");
  }
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNumber - 1) * pageSize;

  try {
    const chatHistory = await MessageModel.aggregate([
      {
        $match: {
          $or: [
            {
              senderId: new mongoose.Types.ObjectId(userId),
              recieverId: new mongoose.Types.ObjectId(friendId),
            },
            {
              senderId: new mongoose.Types.ObjectId(friendId),
              recieverId: new mongoose.Types.ObjectId(userId),
            },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: pageSize,
      },
    ]);

    res.status(200).json(chatHistory.reverse());
  } catch (error) {
    console.error("Error retrieving chat history:", error);
    res.status(500).send("Server error");
  }
});

module.exports = { chatRouter };
