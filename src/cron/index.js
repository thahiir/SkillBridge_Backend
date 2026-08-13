const cron = require("node-cron");

const taskReminder = require("./taskReminder");
const expenseSummary = require("./expenseSummary");
const runExpenseMonitor = require("./expenseMonitor");
const runTaskMonitor = require("./taskMonitor");

const startCronJobs = () => {
  console.log("Starting Cron Jobs...");

  taskReminder();
  expenseSummary();

   cron.schedule("0 * * * *", async () => {

        console.log(
            "Running SkillBridge automation monitors..."
        );

        await runExpenseMonitor();

        await runTaskMonitor();

    });

};

module.exports = startCronJobs;