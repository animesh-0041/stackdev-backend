const express = require("express");
const likeRouter = express.Router();
const { auth } = require("../../middlewares/auth.middlewares");
const { LikeModel } = require("../../models/postLike.model");
const { UserModel } = require("../../models/users.model");
const { httpStatus } = require("../../config/lib/statusCode");
//like and unlike post
likeRouter.post("/like", auth, async (req, res) => {
  const { postId, userId } = req.body;
  // console.log(userId);
  try {
    //like
    const existingLike = await LikeModel.findOne({ postId, userId });

    if (existingLike) {
      await LikeModel.deleteOne({ _id: existingLike._id });
      return res.status(httpStatus.OK).json({ message: "Post unliked" });
    }
    const like = new LikeModel({
      postId,
      userId: userId,
    });
    await like.save();
    res.status(httpStatus.CREATED).json({ message: "Post liked" });
    // Update the lastActive field in the UserModel
    await UserModel.findByIdAndUpdate(
      { _id: userId },
      { lastActive: new Date() }
    );
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});

module.exports = {
  likeRouter,
};
