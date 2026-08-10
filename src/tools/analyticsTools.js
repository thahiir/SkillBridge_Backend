const mongoose = require("mongoose");

const Task = require("../models/Task");
const Expense = require("../models/Expense");
const Notification = require("../models/Notification");

const {
    getDashboardAnalytics,
} = require("../services/dashboardAnalyticsService");

/*
|--------------------------------------------------------------------------
| Gemini Tool Declarations
|--------------------------------------------------------------------------
*/

const analyticsToolDeclarations = [
    {
        name: "get_dashboard_analytics",

        description:
            "Get the authenticated SkillBridge user's complete dashboard analytics " +
            "including task summary, recent tasks, expense summary, spending categories, " +
            "monthly expenses, recent expenses, and notifications.",

        parameters: {
            type: "object",

            properties: {},
        },
    },

    {
        name: "get_productivity_summary",

        description:
            "Analyze the authenticated user's productivity. " +
            "Use this when the user asks how productive they are, " +
            "their task completion rate, completed tasks, pending tasks, " +
            "or what they should focus on.",

        parameters: {
            type: "object",

            properties: {},
        },
    },

    {
        name: "get_task_analytics",

        description:
            "Get detailed task statistics for the authenticated user, " +
            "including total, completed, pending, in-progress, high-priority, " +
            "and overdue tasks.",

        parameters: {
            type: "object",

            properties: {},
        },
    },

    {
        name: "get_expense_analytics",

        description:
            "Get expense analytics for the authenticated user including " +
            "total spending, transaction count, average spending, highest expense, " +
            "lowest expense, and spending by category.",

        parameters: {
            type: "object",

            properties: {},
        },
    },

    {
        name: "get_notification_summary",

        description:
            "Get the authenticated user's total and unread notification counts.",

        parameters: {
            type: "object",

            properties: {},
        },
    },
];

/*
|--------------------------------------------------------------------------
| Dashboard Analytics
|--------------------------------------------------------------------------
*/

const getDashboardAnalyticsTool = async ({
    userId,
}) => {
    const analytics =
        await getDashboardAnalytics(userId);

    return {
        success: true,

        data: {
            taskSummary: analytics.taskSummary,

            recentTasks:
                analytics.recentTasks || [],

            expenseSummary:
                analytics.expenseSummary,

            categorySummary:
                analytics.categorySummary || [],

            monthlyExpense:
                analytics.monthlyExpense || [],

            recentExpenses:
                analytics.recentExpenses || [],

            notificationSummary:
                analytics.notificationSummary,
        },
    };
};

/*
|--------------------------------------------------------------------------
| Productivity Analytics
|--------------------------------------------------------------------------
*/

const getProductivitySummary = async ({
    userId,
}) => {
    const objectId =
        new mongoose.Types.ObjectId(userId);

    const [
        total,
        completed,
        pending,
        inProgress,
        highPriority,
        overdue,
    ] = await Promise.all([

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
            status: "In Progress",
        }),

        Task.countDocuments({
            user: objectId,
            priority: "High",
        }),

        Task.countDocuments({
            user: objectId,

            status: {
                $ne: "Completed",
            },

            dueDate: {
                $lt: new Date(),
            },
        }),
    ]);

    const completionRate =
        total > 0
            ? Math.round(
                  (completed / total) * 100
              )
            : 0;

    return {
        success: true,

        productivity: {
            totalTasks: total,

            completedTasks: completed,

            pendingTasks: pending,

            inProgressTasks: inProgress,

            highPriorityTasks: highPriority,

            overdueTasks: overdue,

            completionRate,
        },
    };
};

/*
|--------------------------------------------------------------------------
| Task Analytics
|--------------------------------------------------------------------------
*/

const getTaskAnalytics = async ({
    userId,
}) => {
    const objectId =
        new mongoose.Types.ObjectId(userId);

    const [
        total,
        completed,
        pending,
        inProgress,
        highPriority,
        overdue,
    ] = await Promise.all([

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
            status: "In Progress",
        }),

        Task.countDocuments({
            user: objectId,
            priority: "High",
        }),

        Task.countDocuments({
            user: objectId,

            status: {
                $ne: "Completed",
            },

            dueDate: {
                $lt: new Date(),
            },
        }),
    ]);

    return {
        success: true,

        taskAnalytics: {
            total,
            completed,
            pending,
            inProgress,
            highPriority,
            overdue,

            completionRate:
                total > 0
                    ? Math.round(
                          (completed / total) * 100
                      )
                    : 0,
        },
    };
};

/*
|--------------------------------------------------------------------------
| Expense Analytics
|--------------------------------------------------------------------------
*/

const getExpenseAnalytics = async ({
    userId,
}) => {
    const objectId =
        new mongoose.Types.ObjectId(userId);

    const summaryResult =
        await Expense.aggregate([

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
        ]);

    const categorySummary =
        await Expense.aggregate([

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

                    transactions: {
                        $sum: 1,
                    },
                },
            },

            {
                $sort: {
                    total: -1,
                },
            },
        ]);

    const summary =
        summaryResult[0] || {
            totalExpense: 0,
            totalTransactions: 0,
            averageExpense: 0,
            highestExpense: 0,
            lowestExpense: 0,
        };

    return {
        success: true,

        expenseAnalytics: {
            totalExpense:
                Math.round(
                    (summary.totalExpense || 0) *
                        100
                ) / 100,

            totalTransactions:
                summary.totalTransactions || 0,

            averageExpense:
                Math.round(
                    (summary.averageExpense || 0) *
                        100
                ) / 100,

            highestExpense:
                summary.highestExpense || 0,

            lowestExpense:
                summary.lowestExpense || 0,

            categories:
                categorySummary.map(
                    (item) => ({
                        category: item._id,

                        total: item.total,

                        transactions:
                            item.transactions,
                    })
                ),
        },
    };
};

/*
|--------------------------------------------------------------------------
| Notification Summary
|--------------------------------------------------------------------------
*/

const getNotificationSummary = async ({
    userId,
}) => {
    const objectId =
        new mongoose.Types.ObjectId(userId);

    const [
        total,
        unread,
    ] = await Promise.all([

        Notification.countDocuments({
            user: objectId,
        }),

        Notification.countDocuments({
            user: objectId,
            isRead: false,
        }),
    ]);

    return {
        success: true,

        notifications: {
            total,
            unread,
        },
    };
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
    analyticsToolDeclarations,

    getDashboardAnalyticsTool,
    getProductivitySummary,
    getTaskAnalytics,
    getExpenseAnalytics,
    getNotificationSummary,
};