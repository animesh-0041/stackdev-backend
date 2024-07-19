const express = require("express");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
const { UserModel } = require("../../models/users.model");
const { httpStatus } = require("../../config/lib/statusCode");
const { v4: uuid } = require("uuid");
const { auth } = require("../../middlewares/auth.middlewares");
const { mongoose } = require("mongoose");

//-------Register User-----------------
userRouter.post("/signup", async (req, res) => {
  const { uIdByFirebase, name, photoURL } = req.body;
  try {
    //if exist user already
    const existingUser = await UserModel.findOneAndUpdate(
      { uIdByFirebase },
      { name, photoURL },
      { new: true, upsert: false, projection: { _id: 1, name: 1, photoURL: 1 } }
    );

    if (existingUser) {
      const token = jwt.sign(
        { userId: existingUser._id, name: existingUser.name },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(httpStatus.OK).json({
        user: existingUser,
        token,
        message: "You are already registered",
      });
    }
    // create new user
    const userName = name?.split(" ")[0] + uuid().replace(/-/g, "").slice(0, 6);
    console.log(userName);
    const user = new UserModel({ ...req.body, userName });
    await user.save();
    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    return res.status(httpStatus.CREATED).json({ user, token });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});

// get user profile details
userRouter.get("/profile", auth, async (req, res) => {
  const { userId } = req.body;
  try {
    const userDetails = await UserModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "posts",
        },
      },
    ]);
    res.status(httpStatus.OK).json(userDetails[0]);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});

module.exports = { userRouter };
