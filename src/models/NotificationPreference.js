const mongoose = require("mongoose");

const notificationPreferenceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        /*
        |--------------------------------------------------------------------------
        | Expense Alerts
        |--------------------------------------------------------------------------
        */

        expenseAlerts: {
            enabled: {
                type: Boolean,
                default: true,
            },

            monthlyBudget: {
                type: Number,
                default: 0,
                min: 0,
            },

            threshold: {
                type: Number,
                default: 80,
                min: 1,
                max: 100,
            },
        },

        /*
        |--------------------------------------------------------------------------
        | Task Alerts
        |--------------------------------------------------------------------------
        */

        taskDueAlerts: {
            enabled: {
                type: Boolean,
                default: true,
            },

            daysBefore: {
                type: Number,
                default: 1,
                min: 0,
            },

            overdueAlert: {
                type: Boolean,
                default: true,
            },
        },

        /*
        |--------------------------------------------------------------------------
        | Notification Channels
        |--------------------------------------------------------------------------
        */

        channels: {
            inApp: {
                type: Boolean,
                default: true,
            },

            email: {
                type: Boolean,
                default: true,
            },

            whatsapp: {
                type: Boolean,
                default: false,
            },

            sms: {
                type: Boolean,
                default: false,
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "NotificationPreference",
    notificationPreferenceSchema
);