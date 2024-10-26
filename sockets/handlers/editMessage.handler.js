const { MessageModel } = require("../../models/message.modal");

const handleMessageEdit = (socket, io, userSockets) => {
  socket.on("edit-message", async (data) => {
    const userId = socket.user.userId;
    const { localMsgId, newContent } = data;

    try {
      const message = await MessageModel.findOne({ localMsgId });

      if (!message) {
        return socket.emit("error", { msg: "Message not found" });
      }

      if (message.senderId.toString() !== userId) {
        return socket.emit("error", {
          msg: "You are not allowed to edit this message",
        });
      }

      message.messageBody.content.value = newContent;
      message.updatedAt = new Date();
      message.isEdited = true;
      await message.save();

      const receiverSocketId = userSockets.get(message?.recieverId?.toString());
      const senderSocketId = userSockets.get(message?.senderId?.toString());

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message-edited", {
          localMsgId: message.localMsgId,
          newContent: message.messageBody.content.value,
          updatedAt: message.updatedAt,
          isEdited: true,
        });
      }

      if (senderSocketId) {
        io.to(senderSocketId).emit("message-edited", {
          localMsgId: message.localMsgId,
          newContent: message.messageBody.content.value,
          updatedAt: message.updatedAt,
          isEdited: true,
        });
      }
    } catch (error) {
      console.error("Error updating the message:", error);
      socket.emit("error", { msg: "Server error, please try again later" });
    }
  });
};

module.exports = { handleMessageEdit };
