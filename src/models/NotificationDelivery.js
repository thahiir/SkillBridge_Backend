const mongoose = require("mongoose");

const notificationDeliverySchema =
    new mongoose.Schema(
        {
            notification: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "Notification",
                required: true,
            },

            user: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            channel: {
                type: String,
                enum: [
                    "EMAIL",
                    "IN_APP",
                ],
                required: true,
            },

            status: {
                type: String,
                enum: [
                    "PENDING",
                    "SENT",
                    "FAILED",
                ],
                default: "PENDING",
            },

            error: {
                type: String,
                default: null,
            },

            sentAt: {
                type: Date,
                default: null,
            },
        },
        {
            timestamps: true,
        }
    );


notificationDeliverySchema.index({
    notification: 1,
    channel: 1,
});


module.exports =
    mongoose.model(
        "NotificationDelivery",
        notificationDeliverySchema
    );