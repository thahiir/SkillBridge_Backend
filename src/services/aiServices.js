const {
    GoogleGenAI,
} = require("@google/genai");

const {
    buildAIContextPrompt,
} = require("./aiContextServices");

const {
    taskToolDeclarations,
    getTasks,
    getTask,
    createTask,
    updateTask,
} = require("../tools/taskTools");

const {
    expenseToolDeclarations,
    getExpenses,
    getExpenseSummary,
    createExpense,
} = require("../tools/expenseTools");

const {
    analyticsToolDeclarations,
    getDashboardAnalyticsTool,
    getProductivitySummary,
    getTaskAnalytics,
    getExpenseAnalytics,
    getNotificationSummary,
} = require("../tools/analyticsTools");

const {
    getAIContext,
} = require("./aiContextServices");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

/*
|--------------------------------------------------------------------------
| All Gemini Tool Declarations
|--------------------------------------------------------------------------
*/

const toolDeclarations = [
    ...taskToolDeclarations,
    ...expenseToolDeclarations,
    ...analyticsToolDeclarations,
];

/*
|--------------------------------------------------------------------------
| Tool Map
|--------------------------------------------------------------------------
|
| Gemini only gives us the function name and arguments.
| We map that name to the actual backend function here.
|
|--------------------------------------------------------------------------
*/

const toolMap = {
    // Tasks
    get_tasks: getTasks,
    get_task: getTask,
    create_task: createTask,
    update_task: updateTask,

    // Expenses
    get_expenses: getExpenses,
    get_expense_summary: getExpenseSummary,
    create_expense: createExpense,

    // Analytics
    get_dashboard_analytics:
        getDashboardAnalyticsTool,

    get_productivity_summary:
        getProductivitySummary,

    get_task_analytics:
        getTaskAnalytics,

    get_expense_analytics:
        getExpenseAnalytics,

    get_notification_summary:
        getNotificationSummary,
};

/*
|--------------------------------------------------------------------------
| Execute Gemini Tool
|--------------------------------------------------------------------------
*/

const executeTool = async ({
    name,
    args,
    userId,
}) => {
    const tool = toolMap[name];

    if (!tool) {
        return {
            success: false,
            error: `Unknown AI tool: ${name}`,
        };
    }

    try {
        /*
        |--------------------------------------------------------------------------
        | IMPORTANT SECURITY RULE
        |--------------------------------------------------------------------------
        |
        | userId comes from the authenticated request.
        |
        | Never allow Gemini to decide the userId.
        |
        |--------------------------------------------------------------------------
        */

        const result = await tool({
            ...(args || {}),
            userId,
        });

        return result;
    } catch (error) {
        console.error(
            `AI Tool Error [${name}]:`,
            error
        );

        return {
            success: false,
            error:
                error.message ||
                "Tool execution failed.",
        };
    }
};

/*
|--------------------------------------------------------------------------
| Parse Final AI Response
|--------------------------------------------------------------------------
*/

const parseAIResponse = (text) => {
    if (!text) {
        return {
            type: "general",

            title: "AI Response",

            message:
                "I couldn't generate a response.",

            data: {},

            recommendations: [],

            actions: [],
        };
    }

    let cleanedText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    try {
        return JSON.parse(cleanedText);
    } catch (error) {
        console.error(
            "AI JSON Parse Error:",
            error.message
        );

        /*
        |--------------------------------------------------------------------------
        | Fallback
        |--------------------------------------------------------------------------
        */

        return {
            type: "general",

            title: "AI Response",

            message: cleanedText,

            data: {},

            recommendations: [],

            actions: [],
        };
    }
};

/*
|--------------------------------------------------------------------------
| Ask Gemini
|--------------------------------------------------------------------------
*/

exports.askAI = async ({
    userId,
    message,
}) => {
    try {
        /*
        |--------------------------------------------------------------------------
        | Get Context
        |--------------------------------------------------------------------------
        */

        const context =
            await getAIContext(userId);

        /*
        |--------------------------------------------------------------------------
        | Build Prompt
        |--------------------------------------------------------------------------
        */

        const prompt =
            buildAIContextPrompt({
                context,
                message,
            });

        /*
        |--------------------------------------------------------------------------
        | Conversation Contents
        |--------------------------------------------------------------------------
        */

        const contents = [
            {
                role: "user",

                parts: [
                    {
                        text: prompt,
                    },
                ],
            },
        ];

        /*
        |--------------------------------------------------------------------------
        | Gemini Configuration
        |--------------------------------------------------------------------------
        */

        const config = {
            tools: [
                {
                    functionDeclarations:
                        toolDeclarations,
                },
            ],

            temperature: 0.3,
        };

        /*
        |--------------------------------------------------------------------------
        | Maximum Tool Loops
        |--------------------------------------------------------------------------
        |
        | Prevent infinite tool-calling loops.
        |
        |--------------------------------------------------------------------------
        */

        const MAX_TOOL_CALLS = 5;

        let toolCallCount = 0;

        /*
        |--------------------------------------------------------------------------
        | Gemini Conversation Loop
        |--------------------------------------------------------------------------
        */

        while (toolCallCount < MAX_TOOL_CALLS) {
            toolCallCount++;

            console.log(
                `===== Gemini Request ${toolCallCount} =====`
            );

            const response =
                await ai.models.generateContent({
                    model: "gemini-2.5-flash",

                    contents,

                    config,
                });

            /*
            |--------------------------------------------------------------------------
            | Check Function Calls
            |--------------------------------------------------------------------------
            */

            const functionCalls =
                response.functionCalls || [];

            /*
            |--------------------------------------------------------------------------
            | No Function Call
            |--------------------------------------------------------------------------
            |
            | Gemini has produced the final response.
            |
            |--------------------------------------------------------------------------
            */

            if (
                functionCalls.length === 0
            ) {
                console.log(
                    "===== Gemini Final Response ====="
                );

                console.log(response.text);

                return parseAIResponse(
                    response.text
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Add Gemini's Function Call Response
            |--------------------------------------------------------------------------
            |
            | Important:
            | We append the model response to the conversation
            | before sending the function response.
            |
            |--------------------------------------------------------------------------
            */

            contents.push(
                response.candidates[0].content
            );

            /*
            |--------------------------------------------------------------------------
            | Execute All Requested Tools
            |--------------------------------------------------------------------------
            */

            const functionResponseParts = [];

            for (
                const functionCall
                of functionCalls
            ) {
                const name =
                    functionCall.name;

                const args =
                    functionCall.args || {};

                console.log(
                    "===== AI TOOL CALL ====="
                );

                console.log(
                    "Tool:",
                    name
                );

                console.log(
                    "Arguments:",
                    JSON.stringify(
                        args,
                        null,
                        2
                    )
                );

                /*
                |--------------------------------------------------------------------------
                | Execute Backend Function
                |--------------------------------------------------------------------------
                */

                const result =
                    await executeTool({
                        name,
                        args,
                        userId,
                    });

                console.log(
                    "Tool Result:",
                    JSON.stringify(
                        result,
                        null,
                        2
                    )
                );

                /*
                |--------------------------------------------------------------------------
                | Send Tool Result Back To Gemini
                |--------------------------------------------------------------------------
                */

                functionResponseParts.push({
                    functionResponse: {
                        name,

                        response: {
                            result,
                        },

                        ...(functionCall.id
                            ? {
                                  id:
                                      functionCall.id,
                              }
                            : {}),
                    },
                });
            }

            /*
            |--------------------------------------------------------------------------
            | Add Tool Results
            |--------------------------------------------------------------------------
            */

            contents.push({
                role: "user",

                parts: functionResponseParts,
            });
        }

        /*
        |--------------------------------------------------------------------------
        | Too Many Tool Calls
        |--------------------------------------------------------------------------
        */

        throw new Error(
            "AI exceeded the maximum number of tool calls."
        );
    } catch (error) {
        console.error(
            "========== GEMINI ERROR =========="
        );

        console.error(error);

        throw new Error(
            "Failed to generate AI response"
        );
    }
};