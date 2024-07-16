const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
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
  tags: {
    type: String,
    default: null,
    validate: {
      validator: function (value) {
        if (this.parentCommentId) {
          return value !== null;
        }
        return true;
      },
      message: "Tags are required when parentCommentId is present.",
    },
  },
});
const commentModel = mongoose.model("comment", commentSchema);
module.exports = {
  commentModel,
};
