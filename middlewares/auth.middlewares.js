const jwt = require("jsonwebtoken");
const { httpStatus } = require("../config/lib/statusCode");

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ msg: "Unauthorized! Please login to access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decoded.userId;
    req.body.name = decoded.name;
    req.body.username = decoded.username;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ msg: "Token expired, please login again" });
    }
    return res.status(httpStatus.UNAUTHORIZED).json({ msg: "Invalid token" });
  }
};

module.exports = { auth };
