const express = require("express");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
const { UserModel } = require("../../models/users.model");
const { httpStatus } = require("../../config/lib/statusCode");

//registetion
userRouter.post("/signup", async (req, res) => {
  const { uIdByFirebase } = req.body;
  console.log(uIdByFirebase);
  try {
    const existingUser = await UserModel.findOne({ uIdByFirebase });
    if (existingUser) {
      const token = jwt.sign(
        { userId: existingUser._id, displayName: existingUser.displayName },
        process.env.JWT_SECRET,
        {
          expiresIn: "5h",
        }
      );
      return res
        .status(httpStatus.CREATED)
        .json({ existingUser, token, message: "you are already registered" });
    }
    const user = new UserModel(req.body);
    await user.save();
    const token = jwt.sign(
      { userId: user._id, displayName: user.displayName },
      process.env.JWT_SECRET,
      {
        expiresIn: "5h",
      }
    );
    return res.status(httpStatus.CREATED).json({ user, token });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error });
  }
});

module.exports = { userRouter };
