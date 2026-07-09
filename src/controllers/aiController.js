const User = require("../models/User");

const { askAI } = require("../services/aiServices");
const { getDashboardAnalytics } = require("../services/dashboardAnalyticsService");

exports.chatWithAI = async (req, res) => {
    try {

        const { message } = req.body;

        // Validate request
        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        // Get logged-in user
        const user = await User.findById(req.user.id)
            .select("Fullname Email");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Get dashboard analytics
        const analytics = await getDashboardAnalytics(req.user.id);

        // Debug (optional)
        console.log("========== AI Analytics ==========");
        console.log(JSON.stringify(analytics, null, 2));

        // Ask Gemini AI
        const reply = await askAI({
            user,
            analytics,
            message,
        });

        res.status(200).json({
            success: true,
            reply,
        });

    } catch (error) {

        console.error("AI Controller Error:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};