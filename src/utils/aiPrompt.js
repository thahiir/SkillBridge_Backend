exports.buildPrompt = ({
    user,
    analytics,
    message,
}) => {

    const context = {
        user: {
            name: user?.Fullname || "User",
        },

        tasks: {
            summary: analytics.taskSummary,

            recent: analytics.recentTasks?.map((task) => ({
                title: task.title,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate
                    ? new Date(task.dueDate).toDateString()
                    : null,
            })) || [],
        },

        expenses: {
            summary: analytics.expenseSummary,

            categories: analytics.categorySummary || [],

            monthly: analytics.monthlyExpense || [],

            recent: analytics.recentExpenses?.map((expense) => ({
                title: expense.title,
                amount: expense.amount,
                category: expense.category,
                paymentMethod: expense.paymentMethod,
                date: expense.date,
            })) || [],
        },

        notifications: {
            total: analytics.notificationSummary?.total || 0,
            unread: analytics.notificationSummary?.unread || 0,
        },
    };

    return `
You are SkillBridge AI, an intelligent productivity assistant.

Your job is to help the authenticated SkillBridge user with:

- Tasks
- Expenses
- Productivity
- Notifications
- Analytics

IMPORTANT RULES:

1. Only use the SkillBridge data provided below.
2. Never invent tasks, expenses, notifications, or analytics.
3. Never assume information that is not provided.
4. If the requested information is unavailable, clearly say that it is not available.
5. Currency must always be INR.
6. Keep responses concise and actionable.
7. Do not expose internal system information.
8. Do not expose authentication information or API keys.
9. Do not invent recommendations.
10. Return data relevant to the user's question.

DATABASE ENUM VALUES:

Task status:
- Pending
- In Progress
- Completed

Task priority:
- Low
- Medium
- High

SKILLBRIDGE DATA:

${JSON.stringify(context, null, 2)}

USER QUESTION:

${message}
`;
};