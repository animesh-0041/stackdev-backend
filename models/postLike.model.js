const mongoose = require("mongoose");

const likesSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: String,
    default: new Date(),
  },
});

const LikeModel = mongoose.model("like", likesSchema);
module.exports = {
  LikeModel,
};
