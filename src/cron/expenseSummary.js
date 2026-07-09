const cron = require("node-cron");
const Expense = require("../models/Expense");
const { createNotification } = require("../services/notificationServices");

const expenseSummary = () => {
  cron.schedule("0 9 1 * *", async () => {
    try {
      console.log("Generating Monthly Expense Summary...");

      const summaries = await Expense.aggregate([
        {
          $group: {
            _id: "$user",
            totalExpense: {
              $sum: "$amount",
            },
          },
        },
      ]);

      for (const summary of summaries) {
        await createNotification({
          title: "Monthly Expense Summary",
          message: `You spent ₹${summary.totalExpense} this month.`,
          type: "EXPENSE",
          user: summary._id,
        });
      }

      console.log(`Expense summaries sent: ${summaries.length}`);
    } catch (error) {
      console.error(error.message);
    }
  });
};

module.exports = expenseSummary;