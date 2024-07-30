const typingUsers = new Map();

const handleTyping = (socket, io, userSockets) => {
  socket.on("typing", (data) => {
    const { senderId, recieverId, isTyping } = data;

    if (isTyping) {
      typingUsers.set(senderId, recieverId);
    } else {
      typingUsers.delete(senderId);
    }

    const receiverSocketId = userSockets.get(recieverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", {
        typingUsers: Array.from(typingUsers.entries())
          .filter(([_, value]) => value === recieverId)
          .map(([key]) => key),
      });
    }
  });
};

module.exports = { handleTyping };
