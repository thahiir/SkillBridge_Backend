const { GoogleGenAI } = require("@google/genai");
const { buildPrompt } = require("../utils/aiPrompt");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

exports.askAI = async ({
    user,
    analytics,
    message,
}) => {
    try {

        console.log("===== Analytics Received =====");
        console.log(JSON.stringify(analytics, null, 2));

        const prompt = buildPrompt({
            user,
            analytics,
            message,
        });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        let text = response.text;

        console.log("========== RAW GEMINI RESPONSE ==========");
        console.log(text);

        // Remove markdown code blocks if Gemini returns them
        text = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        try {
            const jsonResponse = JSON.parse(text);

            return jsonResponse;

        } catch (parseError) {

            console.log("JSON Parse Error:", parseError.message);

            // Fallback if Gemini doesn't return valid JSON
            return {
                type: "general",
                title: "AI Response",
                message: text,
                data: {},
                recommendations: [],
                actions: [],
            };
        }

    } catch (error) {

        console.log("========== GEMINI ERROR ==========");

        console.log(error);

        console.log("Message:", error.message);

        if (error.status) {
            console.log("Status:", error.status);
        }

        if (error.cause) {
            console.log("Cause:", error.cause);
        }

        throw new Error("Failed to generate AI response");
    }
};