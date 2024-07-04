const express = require("express");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
const { UserModel } = require("../../models/users.model");
const { httpStatus } = require("../../config/lib/statusCode");

//-------Register User-----------------
userRouter.post("/signup", async (req, res) => {
  const { uIdByFirebase, name, photoURL } = req.body;
  try {
    //if exist user already
    const existingUser = await UserModel.findOne({ uIdByFirebase });
    if (existingUser) {
      const existUpdatedDetails = await UserModel.updateOne(
        { uIdByFirebase },
        { name, photoURL }
      );
      const token = jwt.sign(
        { userId: existingUser._id, name: existingUser.name },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );
      return res.status(httpStatus.OK).json({
        existUpdatedDetails,
        token,
        message: "you are already registered",
      });
    }
    // create new user
    const user = new UserModel(req.body);
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

// -------Login User-----------------
// (will be taken care in future)

module.exports = { userRouter };
