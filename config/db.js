const mongoose = require("mongoose");
require("dotenv").config();

const connection = mongoose.connect(process.env.MONGO_PROD_URL);

module.exports = {
  connection,
};
