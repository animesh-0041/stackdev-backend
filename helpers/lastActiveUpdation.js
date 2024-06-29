const { UserModel } = require("../models/users.model");

const lastActiveUpdation = async (userId) => {
  if (!userId) {
    console.error("Error: userId is required.");
    throw new Error(error);
  }
  try {
    await UserModel.findByIdAndUpdate(
      { _id: userId },
      { lastActive: new Date() }
    );
    return `User's last active date updated:${userId}`;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
module.exports = { lastActiveUpdation };
