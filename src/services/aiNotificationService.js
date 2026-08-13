const {
    GoogleGenAI,
} = require("@google/genai");

const {
    buildExpenseAlertPrompt,
    buildTaskOverduePrompt,
} = require("../utils/aiNotificationPrompt");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});


const generateAIMessage = async (prompt) => {

    try {

        const response =
            await ai.models.generateContent({
                model: "gemini-2.5-flash",

                contents: prompt,

                config: {
                    temperature: 0.4,
                },
            });

        const text =
            response.text?.trim();

        if (!text) {

            throw new Error(
                "Gemini returned an empty notification."
            );
        }

        return text;

    } catch (error) {

        console.error(
            "AI Notification Error:",
            error
        );

        throw error;
    }
};


/*
|--------------------------------------------------------------------------
| Expense Notification
|--------------------------------------------------------------------------
*/

exports.generateExpenseAlert = async ({
    userName,
    totalExpense,
    monthlyBudget,
    percentage,
    threshold,
}) => {

    const prompt =
        buildExpenseAlertPrompt({
            userName,
            totalExpense,
            monthlyBudget,
            percentage,
            threshold,
        });

    return generateAIMessage(prompt);
};


/*
|--------------------------------------------------------------------------
| Task Overdue Notification
|--------------------------------------------------------------------------
*/

exports.generateTaskOverdueAlert = async ({
    userName,
    taskTitle,
    status,
    priority,
    dueDate,
}) => {

    const prompt =
        buildTaskOverduePrompt({
            userName,
            taskTitle,
            status,
            priority,
            dueDate,
        });

    return generateAIMessage(prompt);
};