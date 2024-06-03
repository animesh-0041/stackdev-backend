const jwt = require("jsonwebtoken");
const { httpStatus } = require("../config/lib/statusCode");
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res
      .status(httpStatus.UNAUTHORIZED)
      .send({ msg: "Please login to access" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.body.userId = decoded.userId;
    req.body.displayName = decoded.displayName;
    next();
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).send({ msg: "session expired" });
  }
};

module.exports = { auth };
