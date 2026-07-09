const Notification = require("../models/Notification");
const mongoose = require("mongoose");

// Create Notification
exports.createNotification = async (req, res) => {
  try {

    const notification = await Notification.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      notification,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Get All Notifications
exports.getNotifications = async (req, res) => {
  try {

    const notifications = await Notification.find({
      user: new mongoose.Types.ObjectId(req.user.id),
    }).sort("-createdAt");

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Get Single Notification
exports.getNotification = async (req, res) => {
  try {

    const notification = await Notification.findOne({
      _id: req.params.id,
      user: new mongoose.Types.ObjectId(req.user.id),
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Mark Notification as Read
exports.markAsRead = async (req, res) => {
  try {

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        user: new mongoose.Types.ObjectId(req.user.id),
      },
      {
        isRead: true,
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Mark All Notifications as Read
exports.markAllAsRead = async (req, res) => {
  try {

    await Notification.updateMany(
      {
        user: req.user.id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Delete Notification
exports.deleteNotification = async (req, res) => {
  try {

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: new mongoose.Types.ObjectId(req.user.id),
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// Notification Summary
exports.getNotificationSummary = async (req, res) => {
  try {

    const summary = await Notification.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: null,
          totalNotifications: {
            $sum: 1,
          },
          readNotifications: {
            $sum: {
              $cond: ["$isRead", 1, 0],
            },
          },
          unreadNotifications: {
            $sum: {
              $cond: ["$isRead", 0, 1],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      summary: summary[0] || {
        totalNotifications: 0,
        readNotifications: 0,
        unreadNotifications: 0,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};