const cron = require("node-cron");
const teask = require("../models/Task");

const {createNotification} = require("../services/notificationServices");
const Task = require("../models/Task");

const taskReminder = () =>{
    cron.schedule("0 8 * * *",async () =>{
        try{
            console.log("Running Daily Task Reminder...");

            const today = new Date();
            today.setHours(0,0,0,0);

            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() +1);

            const tasks = await Task.find({
                dueDate:{
                    $gte:today,
                    $lt:tomorrow,
                },
                status:{$ne:"Completed"},
            });

            for(const task of tasks){
                await createNotification({
                    title: "Task Reminder",
                    message: `Your task "${task.title}" is due today.`,
                    type: "TASK",
                    user: task.user,
                    referenceId: task._id,
                    referenceModel: "Task",
                });
            }
            console.log(`Task reminder sent: ${tasks.length}`);
        }catch(error){
            console.error(error.message);
        }
    });
};

module.exports = taskReminder;