const { MessageModel } = require("../../models/message.modal");

const handleSendMessage = (socket, io, userSockets) => {
  socket.on("send-message", async (data) => {
    const { message, senderId, recieverId } = data;
    const newMessage = new MessageModel({
      senderId,
      recieverId,
      message,
    });
    await newMessage.save();

    const receiverSocketId = userSockets.get(recieverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", {
        senderId,
        message,
      });
    }
  });
};

module.exports = { handleSendMessage };
