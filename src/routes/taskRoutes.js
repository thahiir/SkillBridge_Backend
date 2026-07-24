const express = require("express");

const router = express.Router();

const {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    getTaskSummary
} = require("../controllers/taskController");

const { protect } = require("../middleware/authmiddleware");

router.post("/", protect, createTask);

router.get("/", protect, getTasks);

router.get("/summary", protect,getTaskSummary);

router.get("/:id", protect, getTask);

router.put("/:id", protect, updateTask);

router.delete("/:id", protect, deleteTask);



module.exports = router;