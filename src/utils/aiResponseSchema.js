const aiResponseSchema = {
    type: "object",

    properties: {
        type: {
            type: "string",
            enum: [
                "dashboard",
                "task_summary",
                "expense_summary",
                "notification_summary",
                "analytics",
                "greeting",
                "general"
            ]
        },

        title: {
            type: "string"
        },

        message: {
            type: "string"
        },

        data: {
            type: "object"
        },

        recommendations: {
            type: "array",
            items: {
                type: "string"
            }
        },

        actions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    label: {
                        type: "string"
                    },

                    action: {
                        type: "string"
                    }
                },
                required: ["label", "action"]
            }
        }
    },

    required: [
        "type",
        "title",
        "message",
        "data",
        "recommendations",
        "actions"
    ]
};

module.exports = aiResponseSchema;