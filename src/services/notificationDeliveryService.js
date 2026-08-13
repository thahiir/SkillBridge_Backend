const Notification = require("../models/Notification");
const NotificationDelivery = require("../models/NotificationDelivery");
const sendEmail = require("../utils/sendEmail");


exports.deliverNotification = async ({
    notificationId,
}) => {

    const notification =
        await Notification.findById(
            notificationId
        ).populate({
            path: "user",
            select: "Fullname Email",
        });


    if (!notification) {
        throw new Error(
            "Notification not found"
        );
    }


    const user = notification.user;


    if (!user) {
        throw new Error(
            "Notification user not found"
        );
    }


    if (!user.Email) {
        throw new Error(
            "User email not found"
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Check duplicate
    |--------------------------------------------------------------------------
    */

    const existingDelivery =
        await NotificationDelivery.findOne({

            notification:
                notification._id,

            channel: "EMAIL",

            status: "SENT",
        });


    if (existingDelivery) {

        console.log(
            "Email already sent:",
            notification._id
        );

        return existingDelivery;
    }


    /*
    |--------------------------------------------------------------------------
    | Create Delivery Record
    |--------------------------------------------------------------------------
    */

    let delivery =
        await NotificationDelivery.findOne({

            notification:
                notification._id,

            channel: "EMAIL",
        });


    if (!delivery) {

        delivery =
            await NotificationDelivery.create({

                notification:
                    notification._id,

                user:
                    user._id,

                channel: "EMAIL",

                status: "PENDING",
            });
    }


    /*
    |--------------------------------------------------------------------------
    | Send Email
    |--------------------------------------------------------------------------
    */

    try {

        await sendEmail({

            email: user.Email,

            subject:
                `SkillBridge - ${notification.title}`,

            message: `
Hello ${user.Fullname || "User"},

${notification.title}

${notification.message}

Regards,
SkillBridge
            `.trim(),
        });


        /*
        |--------------------------------------------------------------------------
        | Mark SENT
        |--------------------------------------------------------------------------
        */

        delivery.status = "SENT";

        delivery.sentAt = new Date();

        delivery.error = null;

        await delivery.save();


        console.log(
            "EMAIL SENT:",
            user.Email
        );


        return delivery;

    } catch (error) {

        delivery.status = "FAILED";

        delivery.error =
            error.message;

        await delivery.save();


        console.error(
            "EMAIL FAILED:",
            error.message
        );


        throw error;
    }
};