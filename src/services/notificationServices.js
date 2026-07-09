const Notification = require("../models/Notification");

exports.createNotification = async ({
  title,
  message,
  type = "SYSTEM",
  user,
  referenceId = null,
  referenceModel = null,
}) => {
  try {
    console.log("Notification Service Called");

    const newNotification = await Notification.create({
      title,
      message,
      type,
      user,
      referenceId,
      referenceModel,
    });

    console.log("Notification Created:", newNotification);

    return newNotification;
  } catch (error) {
    console.log("Notification Service Error:", error.message);
    return null;
  }
};