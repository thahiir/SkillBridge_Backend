const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: 100,
    },

    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: 500,
    },

    type: {
      type: String,
      enum: [
        "TASK",
        "EXPENSE",
        "SYSTEM",
        "PROFILE",
        "WELCOME",
      ],
      default: "SYSTEM",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    referenceModel: {
      type: String,
      enum: ["Task", "Expense", null],
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);