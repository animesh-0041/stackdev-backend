// authUtils.js (authentication middleware)
const jwt = require("jsonwebtoken");

// Socket authentication middleware
const socketAuth = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication error: Token is missing."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = {
      userId: decoded.userId,
      name: decoded.name,
      username: decoded.username,
    };
    next();
  } catch (error) {
    return next(new Error("Authentication error: Invalid token."));
  }
};

module.exports = { socketAuth };
