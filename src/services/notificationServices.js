const Notification = require("../models/Notification");

const {
    deliverNotification,
} = require("./notificationDeliveryService");


exports.createNotification = async ({
    userId,
    title,
    message,
    type = "SYSTEM",
    referenceId = null,
    referenceModel = null,
    sendEmail = false,
}) => {

    try {

        if (!userId) {
            throw new Error(
                "userId is required to create notification"
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Create In-App Notification
        |--------------------------------------------------------------------------
        */

        const notification =
            await Notification.create({

                title,

                message,

                type,

                isRead: false,

                referenceId,

                referenceModel,

                // IMPORTANT
                user: userId,
            });


        console.log(
            "Notification created:",
            notification._id
        );


        /*
        |--------------------------------------------------------------------------
        | Email Delivery
        |--------------------------------------------------------------------------
        */

        if (sendEmail) {

            deliverNotification({
                notificationId:
                    notification._id,
            })
                .then(() => {

                    console.log(
                        "Notification email delivered:",
                        notification._id
                    );

                })
                .catch((error) => {

                    console.error(
                        "Notification email delivery failed:",
                        error.message
                    );

                });
        }


        return notification;

    } catch (error) {

        console.error(
            "Create Notification Error:",
            error
        );

        throw error;
    }
};