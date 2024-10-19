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
