require("dotenv").config();

const express = require("express");

const cors = require("cors");

const connectDB = require("./src/config/db");

const app = express();

const taskRoutes = require("./src/routes/taskRoutes");

const startCronJobs = require("./src/cron/index")

connectDB();

app.use(cors());

app.use(express.json());

app.use("/api/user",require("./src/routes/Userroutes"));

app.use("/api/tasks",taskRoutes);

app.use("/api/expenses",require("./src/routes/expenseRoutes"));

app.use("/api/notification",require("./src/routes/notificationRoutes"));

app.use("/api/dashboard",require("./src/routes/dashboardRoutes"));

app.use("/api/ai",require("./src/routes/aiRoutes"));


app.listen(process.env.PORT, () =>{
    console.log(`server runnning @ http://localhost:${process.env.PORT}`);
    startCronJobs();
});

