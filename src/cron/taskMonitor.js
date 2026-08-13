const Task = require("../models/Task");
const Notification = require("../models/Notification");
const NotificationPreference = require("../models/NotificationPreference");
const {
    generateTaskOverdueAlert,
} = require("../services/aiNotificationService");

const {deliverNotification} = require("../services/notificationDeliveryService");

const runTaskMonitor = async () => {

    try {

        console.log(
            "========== TASK MONITOR STARTED =========="
        );

        /*
        |--------------------------------------------------------------------------
        | Get users who enabled overdue alerts
        |--------------------------------------------------------------------------
        */

        const preferences =
            await NotificationPreference.find({
                "taskDueAlerts.enabled": true,

                "taskDueAlerts.overdueAlert": true,
            }).lean();

        const userIds = preferences.map(
            (preference) => preference.user
        );

        if (userIds.length === 0) {

            console.log(
                "No users have task alerts enabled."
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Find overdue tasks
        |--------------------------------------------------------------------------
        */

        const now = new Date();

        const overdueTasks =
            await Task.find({

                user: {
                    $in: userIds,
                },

                status: {
                    $ne: "Completed",
                },

                dueDate: {
                    $ne: null,

                    $lt: now,
                },

            })
                .select(
                    "title status priority dueDate user"
                )
                .lean();

        console.log(
            `Found ${overdueTasks.length} overdue tasks`
        );

        /*
        |--------------------------------------------------------------------------
        | Create notifications
        |--------------------------------------------------------------------------
        */

        for (const task of overdueTasks) {

            const automationKey =
                `task-overdue-${task._id}`;

            /*
            |--------------------------------------------------------------------------
            | Prevent duplicate notification
            |--------------------------------------------------------------------------
            */

            const existingNotification =
                await Notification.findOne({
                    user: task.user,

                    automationKey,
                });

            if (existingNotification) {

                await deliverNotification({
                    notificationId:existingNotification._id
                });

                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Create notification
            |--------------------------------------------------------------------------
            */

            const dueDate =
                new Date(task.dueDate)
                    .toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        }
                    );


        const notification = 
            await Notification.create({

                user: task.user,

                type: "TASK",

                title: "Task Overdue",

                message:
                    `"${task.title}" is overdue. ` +
                    `It was due on ${dueDate}.`,

                isRead: false,

                automationKey,

                referenceId: task._id,

                referenceModel: "Task",
            });
            await deliverNotification({
                notificationId:notification._id,
            })

            console.log(
                `Overdue notification created for task ${task._id}`
            );
        }

        console.log(
            "========== TASK MONITOR COMPLETED =========="
        );

    } catch (error) {

        console.error(
            "Task Monitor Error:",
            error
        );
    }
};

module.exports = runTaskMonitor;