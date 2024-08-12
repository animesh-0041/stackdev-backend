const { NotificationModel } = require("../models/notification.model");

const createNotification = async (newNotification) => {
  try {
    const notification = new NotificationModel(newNotification);
    await notification.save();
    console.log("Notification saved successfully");
  } catch (error) {
    console.error("Error saving notification:", error);
    throw error;
  }
};

module.exports = { createNotification };
