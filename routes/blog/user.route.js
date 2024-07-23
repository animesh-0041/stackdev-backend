const express = require("express");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
const { UserModel } = require("../../models/users.model");
const { httpStatus } = require("../../config/lib/statusCode");
const { v4: uuid } = require("uuid");
const { auth } = require("../../middlewares/auth.middlewares");
const { mongoose } = require("mongoose");
const { conditionalAuth } = require("../../helpers/conditionalAuth");

//-------Register User-----------------
userRouter.post("/signup", async (req, res) => {
  const { uIdByFirebase, name, photoURL } = req.body;
  try {
    //if already exist user
    const existingUser = await UserModel.findOneAndUpdate(
      { uIdByFirebase },
      { name, photoURL },
      {
        new: true,
        upsert: false,
        projection: { _id: 1, name: 1, photoURL: 1, username: 1 },
      }
    );

    if (existingUser) {
      const token = jwt.sign(
        {
          userId: existingUser._id,
          name: existingUser.name,
          username: existingUser.username,
        },
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
    const username = name?.split(" ")[0] + uuid().replace(/-/g, "").slice(0, 6);
    console.log(username);
    const user = new UserModel({ ...req.body, username });
    await user.save();
    const token = jwt.sign(
      { userId: user._id, name: user.name, username: user.username },
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

// get single user profile details
userRouter.get("/profile", async (req, res) => {
  const { username } = req.query;
  try {
    const userDetails = await UserModel.aggregate([{ $match: { username } }]);
    res.status(httpStatus.OK).json(userDetails[0]);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});

// get single user posts
userRouter.get("/profile/post", async (req, res) => {
  const { username, category } = req.query;
  let data;
  try {
    data = await UserModel.aggregate([
      { $match: { username } },
      {
        $lookup: {
          from: "posts",
          localField: "username",
          foreignField: "username",
          as: "data",
        },
      },
      {
        $project: {
          "data.tag": 1,
          "data.createdAt": 1,
          "data.blogHeader": 1,
          "data.view": 1,
          "data.url": 1,
          "data.username": 1,
          "data._id": 1,
        },
      },
    ]);
    res.status(httpStatus.OK).json(data[0].data);
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});

// follow and unfollow user
userRouter.post("/follow-unfollow", auth, async (req, res) => {
  const { userId, followUserId } = req.body;

  if (!userId || !followUserId) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "User not found" });
  }

  try {
    const user = await UserModel.findById(userId);
    const followUser = await UserModel.findById(followUserId);

    const isFollowing = user.following.has(followUserId);
    if (isFollowing) {
      // Unfollow user
      user.following.delete(followUserId);
      followUser.followers.delete(userId);
    } else {
      // Follow user
      user.following.set(followUserId, new Date());
      followUser.followers.set(userId, new Date());
    }

    await user.save();
    await followUser.save();

    return res.status(httpStatus.OK).json({
      message: isFollowing
        ? "User unfollowed successfully"
        : "User followed successfully",
    });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to follow/unfollow user", error });
  }
});

module.exports = { userRouter };
