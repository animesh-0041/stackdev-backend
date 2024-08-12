const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    readBy: {
      type: Map,
      of: Date,
      default: {},
    },
    url: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 7 * 24 * 60 * 60,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const NotificationModel = mongoose.model("Notification", notificationSchema);

module.exports = { NotificationModel };
