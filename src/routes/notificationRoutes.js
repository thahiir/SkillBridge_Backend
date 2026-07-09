const express = require("express");

const router = express.Router();

const {
  createNotification,
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationSummary,
} = require("../controllers/notificationController");

const { protect } = require("../middleware/authmiddleware");

// Create Notification
router.post("/", protect, createNotification);

// Get All Notifications
router.get("/", protect, getNotifications);

// Notification Summary
router.get("/summary", protect, getNotificationSummary);

// Mark All Notifications as Read
router.patch("/read-all", protect, markAllAsRead);

// Get Single Notification
router.get("/:id", protect, getNotification);

// Mark Single Notification as Read
router.patch("/:id/read", protect, markAsRead);

// Delete Notification
router.delete("/:id", protect, deleteNotification);

module.exports = router;