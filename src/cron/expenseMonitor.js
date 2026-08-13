const mongoose = require("mongoose");

const Expense = require("../models/Expense");
const Notification = require("../models/Notification");
const NotificationPreference = require("../models/NotificationPreference");
const {generateExpenseAlert} = require("../services/aiNotificationService");
const {deliverNotification} = require("../services/notificationDeliveryService");

const getCurrentMonthRange = () => {
    const now = new Date();

    const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    const end = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
    );

    return {
        start,
        end,
    };
};

const runExpenseMonitor = async () => {

    try {

        console.log(
            "========== EXPENSE MONITOR STARTED =========="
        );

        const preferences =
            await NotificationPreference.find({
                "expenseAlerts.enabled": true,

                "expenseAlerts.monthlyBudget": {
                    $gt: 0,
                },
            }).lean();

        const {
            start,
            end,
        } = getCurrentMonthRange();

        for (const preference of preferences) {

            const userId = preference.user;

            const budget =
                preference.expenseAlerts.monthlyBudget;

            const threshold =
                preference.expenseAlerts.threshold;

            if (!budget || budget <= 0) {
                continue;
            }

            const userObjectId =
                new mongoose.Types.ObjectId(userId);

            /*
            |--------------------------------------------------------------------------
            | Calculate current month's expense
            |--------------------------------------------------------------------------
            */

            const result =
                await Expense.aggregate([
                    {
                        $match: {
                            user: userObjectId,

                            date: {
                                $gte: start,
                                $lt: end,
                            },
                        },
                    },

                    {
                        $group: {
                            _id: null,

                            total: {
                                $sum: "$amount",
                            },
                        },
                    },
                ]);

            const totalExpense =
                result[0]?.total || 0;

            /*
            |--------------------------------------------------------------------------
            | Calculate percentage
            |--------------------------------------------------------------------------
            */

            const percentage =
                (totalExpense / budget) * 100;

            console.log(
                `User ${userId} | Expense ₹${totalExpense} | Budget ₹${budget} | ${percentage.toFixed(1)}%`
            );

            /*
            |--------------------------------------------------------------------------
            | Check threshold
            |--------------------------------------------------------------------------
            */

            if (percentage < threshold) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Create monthly automation key
            |--------------------------------------------------------------------------
            */

            const monthKey =
                `${start.getFullYear()}-${String(
                    start.getMonth() + 1
                ).padStart(2, "0")}`;

            const automationKey =
                `expense-threshold-${monthKey}`;

            /*
            |--------------------------------------------------------------------------
            | Prevent duplicate notification
            |--------------------------------------------------------------------------
            */

            const existingNotification =
                await Notification.findOne({
                    user: userId,
                    automationKey,
                });

            if (existingNotification) {

                await deliverNotification({
                    notificationId:existingNotification._id,
                });
                
                console.log(
                    `Expense notification already exists for ${userId}`
                );


                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Create notification
            |--------------------------------------------------------------------------
            */

        const notification =
            await Notification.create({

                user: userId,

                type: "EXPENSE",

                title: "Expense Alert",

                message:
                    `You have used ${percentage.toFixed(
                        0
                    )}% of your monthly budget. ` +
                    `Your current spending is ₹${totalExpense.toFixed(
                        2
                    )} out of ₹${budget.toFixed(2)}.`,

                isRead: false,

                automationKey,

                referenceId: null,

                referenceModel: null,
            });

            await deliverNotification({
                notificationId:notification._id,
            })

            console.log(
                `Expense alert created for user ${userId}`
            );
        }

        console.log(
            "========== EXPENSE MONITOR COMPLETED =========="
        );
        
    } catch (error) {

        console.error(
            "Expense Monitor Error:",
            error
        );
    }
};

module.exports = runExpenseMonitor;