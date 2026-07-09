const Task = require("../models/Task");
const Expense = require("../models/Expense");
const Notification = require("../models/Notification");
const mongoose = require("mongoose");

exports.getDashboard = async (req, res) => {
  try {

        const userId = new mongoose.Types.ObjectId(req.user.id);
        
        const [
            totalTasks,
            completedTasks,
            pendingTasks,
            expenseSummary,
            totalNotifications,
            unreadNotifications,
            recentTasks,
            recentExpenses,
            ] = await Promise.all([
            Task.countDocuments({
                user: userId,
            }),

            Task.countDocuments({
                user: userId,
                status: "Completed",
            }),

            Task.countDocuments({
                user: userId,
                status: "Pending",
            }),

            Expense.aggregate([
                {
                $match: {
                    user: userId,
                },
                },
                {
                $group: {
                    _id: null,
                    totalExpense: { $sum: "$amount" },
                    totalTransactions: { $sum: 1 },
                    highestExpense: { $max: "$amount" },
                    averageExpense: { $avg: "$amount" },
                },
                },
            ]),

            Notification.countDocuments({
                user: userId,
            }),

            Notification.countDocuments({
                user: userId,
                isRead: false,
            }),

            Task.find({
                user: userId,
            })
                .sort("-createdAt")
                .limit(5),

            Expense.find({
                user: userId,
            })
                .sort("-createdAt")
                .limit(5),
            ]);
             res.status(200).json({
                success: true,
                dashboard: {
                tasks: {
                total: totalTasks,
                completed: completedTasks,
                pending: pendingTasks,
                },
                expenses:
                expenseSummary[0] || {
                    totalExpense: 0,
                    totalTransactions: 0,
                    highestExpense: 0,
                    averageExpense: 0,
                },
                notifications: {
                total: totalNotifications,
                unread: unreadNotifications,
                },
                recentTasks,
                recentExpenses,
            },
            });


                

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};