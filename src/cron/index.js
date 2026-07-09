const taskReminder = require("./taskReminder");
const expenseSummary = require("./expenseSummary");

const startCronJobs = () => {
  console.log("Starting Cron Jobs...");

  taskReminder();
  expenseSummary();
};

module.exports = startCronJobs;