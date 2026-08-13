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

        /*
        |--------------------------------------------------------------------------
        | Reference
        |--------------------------------------------------------------------------
        |
        | Used when notification belongs to a specific
        | Task or Expense.
        |
        */

        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        referenceModel: {
            type: String,
            enum: ["Task", "Expense", null],
            default: null,
        },

        /*
        |--------------------------------------------------------------------------
        | Automation Key
        |--------------------------------------------------------------------------
        |
        | Used by automated notifications.
        |
        | Examples:
        |
        | expense-threshold-2026-08
        | task-overdue-<taskId>
        |
        */

        automationKey: {
            type: String,
            default: null,
            index: true,
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

/*
|--------------------------------------------------------------------------
| Compound index
|--------------------------------------------------------------------------
|
| Helps us quickly check whether a particular
| automated notification was already created.
|
*/

notificationSchema.index({
    user: 1,
    automationKey: 1,
});

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);