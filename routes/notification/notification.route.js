const express = require("express");
const { auth } = require("../../middlewares/auth.middlewares");
const { NotificationModel } = require("../../models/notification.model");
const { httpStatus } = require("../../config/lib/statusCode");
const { mongoose } = require("mongoose");
const notificationRouter = express.Router();

// get notifications
notificationRouter.get("/notification", auth, async (req, res) => {
  const { userId } = req.body;
  const { read = false } = req.query;

  try {
    if (!userId) {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Please register to get notifications" });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const notifications = await NotificationModel.aggregate([
      {
        $match: {
          $or: [{ targetUsers: { $size: 0 } }, { targetUsers: userObjectId }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creatorDetails",
        },
      },
      {
        $unwind: "$creatorDetails",
      },
      {
        $addFields: {
          isRead: {
            $cond: [
              { $eq: [{ $type: `$readBy.${userId}` }, "missing"] },
              false,
              true,
            ],
          },
        },
      },

      {
        $match: {
          isRead: read === "true",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          creator: {
            _id: "$creatorDetails._id",
            name: "$creatorDetails.name",
            email: "$creatorDetails.email",
            username: "$creatorDetails.username",
            photoURL: "$creatorDetails.photoURL",
          },
          title: 1,
          body: 1,
          url: 1,
          createdAt: 1,
          updatedAt: 1,
          isRead: 1,
        },
      },
    ]);

    res.status(httpStatus.OK).json(notifications);
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to get notifications", error });
  }
});

// read notification
notificationRouter.patch(
  "/notification/read/:notificationId",
  auth,
  async (req, res) => {
    const { notificationId } = req.params;
    const { userId } = req.body;
    try {
      const notification = await NotificationModel.findById(notificationId);

      if (!notification) {
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ message: "Notification not found" });
      }
      const userObjectId = new mongoose.Types.ObjectId(userId);
      notification.readBy.set(userObjectId, new Date());

      await notification.save();
      return res
        .status(httpStatus.OK)
        .json({ message: "Notification read successfully" });
    } catch (error) {
      return res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: "Failed to read notification" });
    }
  }
);

module.exports = { notificationRouter };
