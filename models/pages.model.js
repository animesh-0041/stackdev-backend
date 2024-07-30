const mongoose = require("mongoose");

const pagesSchema = mongoose.Schema(
  {
    content: {
      type: [],
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
    username: {
      type: String,
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
    likes: {
      type: Map,
      of: Date,
      default: {},
    },
  },
  {
    versionKey: false,
  }
);

const PagesModel = mongoose.model("Pages", pagesSchema);

module.exports = { PagesModel };
