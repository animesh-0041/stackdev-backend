const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: null,
    },
    userName: {
      type: String,
      default: null,
    },
    uIdByFirebase:{
      type: String,
      required: true,
      default: null,
    },
    photoURL: {
      type: String,
      default: null,
    },
    lastActive: {
      type: String,
      default: new Date(),
    },
    isBloked: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    registerOption: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
  }
);

const UserModel = mongoose.model("user", userSchema);

module.exports = {
  UserModel,
};
