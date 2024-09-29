const { MessageModel } = require("../../models/message.modal");

const handleSendMessage = (socket, io, userSockets) => {
  socket.on("send-message", async (data) => {
    console.log("send-message", data);
    const { message, senderId, recieverId, localMsgId } = data;
    const newMessage = new MessageModel({
      senderId,
      recieverId,
      message,
      localMsgId,
    });
    await newMessage.save();

    const receiverSocketId = userSockets.get(recieverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive-message", {
        senderId,
        message,
        localMsgId,
      });
    }
  });
};

module.exports = { handleSendMessage };
