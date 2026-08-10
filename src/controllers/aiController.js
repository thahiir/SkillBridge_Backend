
const { askAI } = require("../services/aiServices");

exports.chatWithAI = async (req, res) => {
    try {

        const { message } = req.body;

        // Validate message
        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        // User comes from protect middleware
        const userId = req.user.id;

        console.log("========== AI REQUEST ==========");
        console.log("User ID:", userId);
        console.log("Message:", message);

        // Ask AI
        const reply = await askAI({
            userId,
            message,
        });

        return res.status(200).json({
            success: true,
            reply,
        });

    } catch (error) {

        console.error("AI Controller Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "AI request failed",
        });
    }
};