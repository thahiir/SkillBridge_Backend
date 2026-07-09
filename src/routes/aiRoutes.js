const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authmiddleware");

const {
    chatWithAI,
} = require("../controllers/aiController");

// AI Chat
router.post("/chat", protect, chatWithAI);

module.exports = router;