const { MessageModel } = require("../../models/message.modal");

const handleMessageDelete = (socket, io, userSockets) => {
  socket.on("delete-message", async (data) => {
    const userId = socket.user.userId;
    const { deleteForEveryone, localMsgId } = data;

    try {
      const message = await MessageModel.findOne({ localMsgId });

      if (!message) {
        return socket.emit("error", { msg: "Message not found" });
      }

      if (deleteForEveryone) {
        if (message.senderId.toString() !== userId) {
          return socket.emit("error", {
            msg: "Only the sender can delete this message for everyone",
          });
        }

        // Update message as deleted for everyone
        message.isDeletedForEveryone = true;
        message.isVisibleSelfUser = false;
        message.deletedTimestamp = new Date();
        message.messageBody = {
          type: "text",
          content: { value: "This message was deleted" },
        };
        await message.save();

        // Notify both sender and receiver about the deletion
        const receiverSocketId = userSockets.get(
          message?.recieverId?.toString()
        );
        const senderSocketId = userSockets.get(message?.senderId?.toString());
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("messageDeleted", {
            deleteForEveryone,
            localMsgId,
          });
        }
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageDeleted", {
            deleteForEveryone,
            localMsgId,
          });
        }
      } else {
        // Handle delete for yourself (soft delete)
        if (!message.deletedForUserIds.includes(userId)) {
          message.deletedForUserIds.push(userId);
          message.isVisibleSelfUser = false;
          await message.save();
        }

        // Notify the user who deleted the message
        socket.emit("messageDeleted", { deleteForEveryone, localMsgId });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      socket.emit("error", { msg: "Server error, please try again later" });
    }
  });
};

module.exports = { handleMessageDelete };
