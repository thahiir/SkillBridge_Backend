const mongoose = require("mongoose");

const Task = require("../models/Task");
const Expense = require("../models/Expense");
const Notification = require("../models/Notification");

exports.getDashboardAnalytics = async (userId) => {
    const objectId = new mongoose.Types.ObjectId(userId);

    const [
        totalTasks,
        completedTasks,
        pendingTasks,
        highPriorityTasks,
        recentTasks,

        expenseSummary,
        categorySummary,
        monthlyExpense,
        recentExpenses,

        totalNotifications,
        unreadNotifications,

    ] = await Promise.all([

        // ===========================
        // TASK ANALYTICS
        // ===========================

        Task.countDocuments({
            user: objectId,
        }),

        Task.countDocuments({
            user: objectId,
            status: "Completed",
        }),

        Task.countDocuments({
            user: objectId,
            status: "Pending",
        }),

        Task.countDocuments({
            user: objectId,
            priority: "High",
        }),

        Task.find({
            user: objectId,
        })
            .sort("-createdAt")
            .limit(5)
            .select("title status priority dueDate"),

        // ===========================
        // EXPENSE SUMMARY
        // ===========================

        Expense.aggregate([
            {
                $match: {
                    user: objectId,
                },
            },
            {
                $group: {
                    _id: null,

                    totalExpense: {
                        $sum: "$amount",
                    },

                    totalTransactions: {
                        $sum: 1,
                    },

                    averageExpense: {
                        $avg: "$amount",
                    },

                    highestExpense: {
                        $max: "$amount",
                    },

                    lowestExpense: {
                        $min: "$amount",
                    },
                },
            },
        ]),

        // ===========================
        // CATEGORY SUMMARY
        // ===========================

        Expense.aggregate([
            {
                $match: {
                    user: objectId,
                },
            },
            {
                $group: {
                    _id: "$category",

                    total: {
                        $sum: "$amount",
                    },
                },
            },
            {
                $sort: {
                    total: -1,
                },
            },
        ]),

        // ===========================
        // MONTHLY SUMMARY
        // ===========================

        Expense.aggregate([
            {
                $match: {
                    user: objectId,
                },
            },
            {
                $group: {
                    _id: {
                        year:{
                            $year:"$date",
                        },
                        month: {
                            $month: "$date",
                        },
                    },

                    total: {
                        $sum: "$amount",
                    },
                },
            },
            {
                $sort: {
                    "_id.month": 1,
                },
            },
        ]),

        // ===========================
        // RECENT EXPENSES
        // ===========================

        Expense.find({
            user: objectId,
        })
            .sort("-createdAt")
            .limit(5)
            .select("title amount category paymentMethod date"),

        // ===========================
        // NOTIFICATIONS
        // ===========================

        Notification.countDocuments({
            user: objectId,
        }),

        Notification.countDocuments({
            user: objectId,
            isRead: false,
        }),
    ]);

    return {

        taskSummary: {

            total: totalTasks,

            completed: completedTasks,

            pending: pendingTasks,

            highPriority: highPriorityTasks,

        },

        expenseSummary:

            expenseSummary[0] || {

                totalExpense: 0,

                totalTransactions: 0,

                averageExpense: 0,

                highestExpense: 0,

                lowestExpense: 0,

            },

        categorySummary,

        monthlyExpense,

        notificationSummary: {

            total: totalNotifications,

            unread: unreadNotifications,

        },

        recentTasks,

        recentExpenses,
    };
};