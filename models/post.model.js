const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  url: {
    type: String,
    default: null,
  },
  createdAt: {
    type: String,
    default: new Date(),
  },
});

const PostModel = mongoose.model("Post", postSchema);
module.exports = { PostModel };
