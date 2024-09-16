const mongoose = require("mongoose");
require("dotenv").config();

const connection = mongoose.connect(process.env.MONGO_DEV_URL);

module.exports = {
  connection,
};

// mongo configaration