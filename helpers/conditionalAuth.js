const { auth } = require("../middlewares/auth.middlewares");

const conditionalAuth = (req, res, next) => {
  if (req.headers.authorization) {
      console.log("inner");
      auth(req, res, next);
    } else {
      req.user = null;
      next();
    }
  };
  module.exports = {
    conditionalAuth,
  };