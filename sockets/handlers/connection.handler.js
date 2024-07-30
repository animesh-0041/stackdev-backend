const onlineUsers = new Set();

const handleNewUserJoined = (socket, io, userSockets) => {
  socket.on("new-user-joined", (userId) => {
    onlineUsers.add(userId);
    userSockets.set(userId, socket.id);
    io.emit("online-users", Array.from(onlineUsers));
  });
};

const handleDisconnect = (socket, io, userSockets) => {
  socket.on("disconnect", () => {
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        onlineUsers.delete(userId);
        io.emit("online-users", Array.from(onlineUsers));
        break;
      }
    }
  });
};

module.exports = { handleNewUserJoined, handleDisconnect };
