const { Server } = require("socket.io");
const {
  handleNewUserJoined,
  handleDisconnect,
} = require("./handlers/connection.handler");
const { handleSendMessage } = require("./handlers/message.handler");
const { handleTyping } = require("./handlers/typing.handler");
const { handleMessageDelete } = require("./handlers/deleteMessage.handler");
const { socketAuth } = require("../middlewares/socketAuth.middlewares");
const { handleMessageEdit } = require("./handlers/editMessage.handler");

let io;
const initializeSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  const userSockets = new Map();
  io.use(socketAuth);
  io.on("connection", (socket) => {
    handleNewUserJoined(socket, io, userSockets);
    handleSendMessage(socket, io, userSockets);
    handleTyping(socket, io, userSockets);
    handleDisconnect(socket, io, userSockets);
    handleMessageDelete(socket, io, userSockets);
    handleMessageEdit(socket, io, userSockets);
  });
};

module.exports = { initializeSocketServer, io };
