const { UserModel } = require("./models/users.model");

const findAndRemoveDuplicates = async (email) => {
  try {
    const users = await UserModel.aggregate([
      {
        $match: { email: email },
      },
      {
        $group: {
          _id: { email: "$email" },
          count: { $sum: 1 },
          docs: { $push: "$_id" },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ]);

    for (const user of users) {
      const [firstDocId, ...duplicateDocIds] = user.docs;

      console.log(
        `Removing duplicates for email: ${user._id.email}`,
        duplicateDocIds
      );

      await UserModel.deleteMany({ _id: { $in: duplicateDocIds } });
    }
  } catch (err) {
    console.error("Error finding or removing duplicates", err);
  }
};
module.exports = { findAndRemoveDuplicates };
