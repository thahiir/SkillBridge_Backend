const Task = require("../models/Task");

const { createNotification, } = require("../services/notificationServices");

const mongoose = require("mongoose")

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
            sendEmail:false,
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

        const {
            search,
            status,
            priority,
            sort = "-createdAt",
            page = 1,
            limit = 10,
        } = req.query;

        const query = {
            user: req.user.id,
        };

        if (search) {
            query.title = {
                $regex: search,
                $options: "i",
            };
        }

        if (status) {
            query.status = status;
        }

        if (priority) {
            query.priority = priority;
        }

        const currentPage = Number(page);
        const pageLimit = Number(limit);

        const totalTasks = await Task.countDocuments(query);

        const tasks = await Task.find(query)
            .sort(sort)
            .skip((currentPage - 1) * pageLimit)
            .limit(pageLimit);

        res.status(200).json({
            success: true,
            tasks,
            pagination: {
                total: totalTasks,
                page: currentPage,
                limit: pageLimit,
                pages: Math.ceil(totalTasks / pageLimit),
            },
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
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
            sendEmail:false,
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

exports.getTaskSummary = async (req, res) => {
    try {

        const summary = await Task.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.user.id),
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },

                    pending: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "Pending"] },
                                1,
                                0,
                            ],
                        },
                    },

                    inProgress: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "In Progress"] },
                                1,
                                0,
                            ],
                        },
                    },

                    completed: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "Completed"] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
        ]);

        res.status(200).json({
            success: true,
            summary: summary[0] || {
                total: 0,
                pending: 0,
                inProgress: 0,
                completed: 0,
            },
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};


