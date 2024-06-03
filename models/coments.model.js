const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
});
const commentModel = mongoose.model("comment", commentSchema);
module.exports = {
  commentModel,
};
