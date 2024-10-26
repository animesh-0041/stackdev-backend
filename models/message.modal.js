const mongoose = require("mongoose");
const messageSchema = mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    recieverId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    messageBody: {
      type: Object,
      default: {},
    },
    isVisibleSelfUser: {
      type: Boolean,
      default: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    deletedForUserIds: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    isDeletedForEveryone: {
      type: Boolean,
      default: false,
    },
    deletedTimestamp: {
      type: Date,
    },
    localMsgId: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
const MessageModel = mongoose.model("message", messageSchema);
module.exports = {
  MessageModel,
};
