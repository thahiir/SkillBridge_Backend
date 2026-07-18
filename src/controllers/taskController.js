const Task = require("../models/Task");

const { createNotification, } = require("../services/notificationServices");

exports.createTask = async (req, res) => {
    try {

        const task = await Task.create({
            ...req.body,
            user: req.user.id,
        });
        await createNotification({
            title: "Task Created",
            message: `Task "${task.title}" has been created successfully.`,
            type: "TASK",
            user: new mongoose.Types.ObjectId(req.user.id),
            referenceId: task._id,
            referenceModel: "Task",
        });

        res.status(201).json({
            success:true,
            task,
        });

    } catch (error) {

        res.status(500).json({
            success:false,
            message:error.message,
        });

    }
};

exports.getTasks = async (req, res) => {
    try {

        const tasks = await Task.find({
            user:req.user.id,
        });

        res.status(200).json({
            success:true,
            count:tasks.length,
            tasks,
        });

    } catch (error) {

        res.status(500).json({
            success:false,
            message:error.message,
        });

    }
};

exports.getTask = async (req, res) => {
    try {

        const task = await Task.findOne({
            _id:req.params.id,
            user:new mongoose.Types.ObjectId(req.user.id),
        });

        if(!task){
            return res.status(404).json({
                success:false,
                message:"Task not found",
            });
        }

        res.status(200).json({
            success:true,
            task,
        });

    } catch (error) {

        res.status(500).json({
            success:false,
            message:error.message,
        });

    }
};

exports.updateTask = async (req, res) => {
    try {

        const task = await Task.findOneAndUpdate(
            {
                _id:req.params.id,
                user:req.user.id,
            },
            req.body,
            {
                new:true,
                runValidators:true,
            }
        );
        if (!task) {
            return res.status(404).json({
            success: false,
            message: "Task not found",
            });
}
        await createNotification({
            title: "Task Updated",
            message: `"${task.title}" has been updated.`,
            type: "TASK",
            user: new mongoose.Types.ObjectId(req.user.id),
            referenceId: task._id,
            referenceModel: "Task",
        });


        res.status(200).json({
            success:true,
            task,
        });

    } catch (error) {

        res.status(500).json({
            success:false,
            message:error.message,
        });

    }
};
exports.deleteTask = async (req, res) => {
    try {

        const task = await Task.findOneAndDelete({
            _id:req.params.id,
            user:new mongoose.Types.ObjectId(req.user.id),
        });
        if(!task){
            return res.status(404).json({
                success:false,
                message:"Task not found",
            });
        }
        
        await createNotification({
            title: "Task Deleted",
            message: `"${task.title}" has been deleted.`,
            type: "TASK",
            user: req.user.id,
        });

        

        res.status(200).json({
            success:true,
            message:"Task deleted successfully",
        });

    } catch (error) {

        res.status(500).json({
            success:false,
            message:error.message,
        });

    }
};


