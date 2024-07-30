const { Server } = require("socket.io");
const {
  handleNewUserJoined,
  handleDisconnect,
} = require("./handlers/connection.handler");
const { handleSendMessage } = require("./handlers/message.handler");
const { handleTyping } = require("./handlers/typing.handler");

let io;
const initializeSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  const userSockets = new Map();
  const onlineUsers = new Set();
  const typingUsers = new Map();
  io.on("connection", (socket) => {
    handleNewUserJoined(socket, io, userSockets);
    handleSendMessage(socket, io, userSockets);
    handleTyping(socket, io, userSockets);
    handleDisconnect(socket, io, userSockets);
  });
};

module.exports = { initializeSocketServer, io };
