const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    content: {
      type: [],
      required: true,
    },
    tag: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    view: {
      type: Number,
      default: 0,
    },
    url: {
      type: String,
      default: null,
    },
    blogHeader: {
      type: {},
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

const PostModel = mongoose.model("Post", postSchema);
module.exports = { PostModel };
