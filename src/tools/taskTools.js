const mongoose = require("mongoose");
const Task = require("../models/Task");

/*
|--------------------------------------------------------------------------
| Gemini Tool Declarations
|--------------------------------------------------------------------------
*/

const taskToolDeclarations = [
    {
        name: "get_tasks",

        description:
            "Get tasks belonging to the authenticated SkillBridge user. " +
            "Use this when the user asks about tasks, pending tasks, " +
            "completed tasks, high priority tasks, or tasks matching a status or priority.",

        parameters: {
            type: "object",

            properties: {
                status: {
                    type: "string",

                    enum: [
                        "Pending",
                        "In Progress",
                        "Completed",
                    ],

                    description:
                        "Optional task status filter.",
                },

                priority: {
                    type: "string",

                    enum: [
                        "Low",
                        "Medium",
                        "High",
                    ],

                    description:
                        "Optional task priority filter.",
                },
            },
        },
    },

    {
        name: "get_task",

        description:
            "Get a specific task belonging to the authenticated SkillBridge user.",

        parameters: {
            type: "object",

            properties: {
                taskId: {
                    type: "string",

                    description:
                        "MongoDB ObjectId of the task.",
                },
            },

            required: ["taskId"],
        },
    },

    {
        name: "create_task",

        description:
            "Create a new task for the authenticated SkillBridge user. " +
            "Use this when the user explicitly asks to create or add a task.",

        parameters: {
            type: "object",

            properties: {
                title: {
                    type: "string",

                    description:
                        "Title of the task.",
                },

                description: {
                    type: "string",

                    description:
                        "Optional description of the task.",
                },

                priority: {
                    type: "string",

                    enum: [
                        "Low",
                        "Medium",
                        "High",
                    ],

                    description:
                        "Priority of the task. Defaults to Medium.",
                },

                dueDate: {
                    type: "string",

                    description:
                        "Optional due date in YYYY-MM-DD format.",
                },
            },

            required: ["title"],
        },
    },

    {
        name: "update_task",

        description:
            "Update an existing task belonging to the authenticated SkillBridge user. " +
            "Use this when the user explicitly asks to modify a task.",

        parameters: {
            type: "object",

            properties: {
                taskId: {
                    type: "string",

                    description:
                        "MongoDB ObjectId of the task.",
                },

                title: {
                    type: "string",
                },

                description: {
                    type: "string",
                },

                status: {
                    type: "string",

                    enum: [
                        "Pending",
                        "In Progress",
                        "Completed",
                    ],
                },

                priority: {
                    type: "string",

                    enum: [
                        "Low",
                        "Medium",
                        "High",
                    ],
                },

                dueDate: {
                    type: "string",

                    description:
                        "Due date in YYYY-MM-DD format.",
                },
            },

            required: ["taskId"],
        },
    },
];

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const formatTask = (task) => ({
    id: task._id.toString(),
    title: task.title,
    description: task.description || "",
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate
        ? task.dueDate.toISOString().split("T")[0]
        : null,
    createdAt: task.createdAt
        ? task.createdAt.toISOString()
        : null,
    updatedAt: task.updatedAt
        ? task.updatedAt.toISOString()
        : null,
});

/*
|--------------------------------------------------------------------------
| Get Tasks
|--------------------------------------------------------------------------
*/

const getTasks = async ({
    userId,
    status,
    priority,
}) => {
    const filter = {
        user: userId,
    };

    if (status) {
        filter.status = status;
    }

    if (priority) {
        filter.priority = priority;
    }

    const tasks = await Task.find(filter)
        .sort({
            dueDate: 1,
            createdAt: -1,
        })
        .limit(50)
        .select(
            "title description status priority dueDate createdAt updatedAt"
        )
        .lean();

    return {
        success: true,
        count: tasks.length,
        tasks: tasks.map(formatTask),
    };
};

/*
|--------------------------------------------------------------------------
| Get Single Task
|--------------------------------------------------------------------------
*/

const getTask = async ({
    userId,
    taskId,
}) => {
    if (!validateObjectId(taskId)) {
        return {
            success: false,
            message: "Invalid task ID.",
        };
    }

    const task = await Task.findOne({
        _id: taskId,
        user: userId,
    })
        .select(
            "title description status priority dueDate createdAt updatedAt"
        )
        .lean();

    if (!task) {
        return {
            success: false,
            message: "Task not found.",
        };
    }

    return {
        success: true,
        task: formatTask(task),
    };
};

/*
|--------------------------------------------------------------------------
| Create Task
|--------------------------------------------------------------------------
*/

const createTask = async ({
    userId,
    title,
    description,
    priority,
    dueDate,
}) => {
    if (!title || !title.trim()) {
        return {
            success: false,
            message: "Task title is required.",
        };
    }

    let parsedDueDate;

    if (dueDate) {
        parsedDueDate = new Date(dueDate);

        if (Number.isNaN(parsedDueDate.getTime())) {
            return {
                success: false,
                message:
                    "Invalid due date. Use YYYY-MM-DD format.",
            };
        }
    }

    const task = await Task.create({
        title: title.trim(),

        description: description
            ? description.trim()
            : "",

        status: "Pending",

        priority: priority || "Medium",

        dueDate: parsedDueDate,

        user: userId,
    });

    return {
        success: true,

        message: "Task created successfully.",

        task: formatTask(task),
    };
};

/*
|--------------------------------------------------------------------------
| Update Task
|--------------------------------------------------------------------------
*/

const updateTask = async ({
    userId,
    taskId,
    title,
    description,
    status,
    priority,
    dueDate,
}) => {
    if (!validateObjectId(taskId)) {
        return {
            success: false,
            message: "Invalid task ID.",
        };
    }

    const updates = {};

    if (title !== undefined) {
        updates.title = title.trim();
    }

    if (description !== undefined) {
        updates.description = description;
    }

    if (status !== undefined) {
        updates.status = status;
    }

    if (priority !== undefined) {
        updates.priority = priority;
    }

    if (dueDate !== undefined) {
        if (dueDate === null || dueDate === "") {
            updates.dueDate = null;
        } else {
            const parsedDate = new Date(dueDate);

            if (Number.isNaN(parsedDate.getTime())) {
                return {
                    success: false,
                    message:
                        "Invalid due date. Use YYYY-MM-DD format.",
                };
            }

            updates.dueDate = parsedDate;
        }
    }

    const task = await Task.findOneAndUpdate(
        {
            _id: taskId,

            // VERY IMPORTANT:
            // AI can only update the authenticated user's task.
            user: userId,
        },

        updates,

        {
            new: true,
            runValidators: true,
        }
    );

    if (!task) {
        return {
            success: false,
            message: "Task not found.",
        };
    }

    return {
        success: true,

        message: "Task updated successfully.",

        task: formatTask(task),
    };
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
    taskToolDeclarations,

    getTasks,
    getTask,
    createTask,
    updateTask,
};