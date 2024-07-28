const mongoose = require("mongoose");

const BookSchema = mongoose.Schema(
  {
    pages: {
      type: [],
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
    username: {
      type: String,
      required: true,
    },
    view: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      default: null,
      required: true,
    },
    url: {
      type: String,
      default: null,
      required: true,
    },
    desc: {
      type: String,
      default: "please checkout my new book",
    },
    coverImage: {
      type: String,
      default:
        "https://images.pexels.com/photos/2237801/pexels-photo-2237801.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const BooksModel = mongoose.model("books", BookSchema);

module.exports = { BooksModel };
