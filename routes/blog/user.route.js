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
  const { uIdByFirebase, name, photoURL, fcmToken } = req.body;
  try {
    //if already exist user
    const existingUser = await UserModel.findOneAndUpdate(
      { uIdByFirebase },
      { name, photoURL, fcmToken },
      {
        new: true,
        upsert: false,
        projection: { _id: 1, name: 1, photoURL: 1, username: 1, email: 1 },
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
        message: "You already registered login successfully",
      });
    }
    // create new user
    const username = name?.split(" ")[0] + uuid().replace(/-/g, "").slice(0, 6);
    const user = new UserModel({ ...req.body, username });
    await user.save();
    const token = jwt.sign(
      { userId: user._id, name: user.name, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    const userResponse = {
      _id: user._id,
      name: user.name,
      photoURL: user.photoURL,
      username: user.username,
      email: user.email,
    };
    return res.status(httpStatus.CREATED).json({
      user: userResponse,
      token,
      message: "User created successfully",
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});

//-------Login User-----------------
userRouter.post("/login", async (req, res) => {
  const { uIdByFirebase } = req.body;
  try {
    const user = await UserModel.findOne({ uIdByFirebase }).select(
      "_id name photoURL username email"
    );
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const token = jwt.sign(
      { userId: user._id, name: user.name, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res
      .status(httpStatus.OK)
      .json({ user, token, message: "User logged in successfully" });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});

// get single user profile details
userRouter.get("/profile", conditionalAuth, async (req, res) => {
  const { username } = req.query;
  const { userId } = req.body;
  let userDetails;
  try {
    userDetails = await UserModel.aggregate([
      { $match: { username } },
      {
        $addFields: {
          followersCount: { $size: { $objectToArray: "$followers" } },
          followingCount: { $size: { $objectToArray: "$following" } },
        },
      },
    ]);
    if (!userDetails.length) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }
    if (userId) {
      const isFollowing = userDetails[0]?.followers.hasOwnProperty(userId);
      userDetails[0].isFollowing = isFollowing;
    } else {
      userDetails[0].isFollowing = false;
    }

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
    switch (category) {
      case "stories":
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
          { $unwind: "$data" },
          {
            $project: {
              _id: "$data._id",
              tag: "$data.tag",
              createdAt: "$data.createdAt",
              blogHeader: "$data.blogHeader",
              view: "$data.view",
              url: "$data.url",
              username: "$data.username",
            },
          },
          {
            $sort: { createdAt: -1 },
          },
        ]);
        break;
      case "about":
        data = await UserModel.findOne({ username });
        break;
      default:
        res.status(httpStatus.BAD_REQUEST).json({ error: "Invalid category" });
        break;
    }
    res.status(httpStatus.OK).json(data);
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
      status: !isFollowing,
    });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Failed to follow/unfollow user", error });
  }
});

// update user profile
userRouter.patch("/update", auth, async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "User not found" });
  }
  try {
    await UserModel.updateOne({ _id: userId }, { $set: { ...req.body } });
    return res
      .status(httpStatus.OK)
      .json({ message: "User updated successfully" });
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to update user" });
  }
});

// auto recomendation user profile to a user
userRouter.get("/recomendation-profile", async (req, res) => {
  try {
    const topUsers = await UserModel.aggregate([
      {
        $addFields: {
          followersCount: {
            $size: { $ifNull: [{ $objectToArray: "$followers" }, []] },
          },
        },
      },
      {
        $sort: { followersCount: -1 },
      },
      {
        $limit: 3,
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          username: 1,
          photoURL: 1,
          followersCount: 1,
          bio: 1,
          skills: 1,
          company: 1,
          current_city: 1,
          collage: 1,
        },
      },
    ]);

    return res.status(httpStatus.OK).json(topUsers);
  } catch (error) {
    return res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: "Failed to recommend user" });
  }
});

module.exports = { userRouter };
