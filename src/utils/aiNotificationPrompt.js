exports.buildExpenseAlertPrompt = ({
    userName,
    totalExpense,
    monthlyBudget,
    percentage,
    threshold,
}) => {

    return `
You are SkillBridge AI, a productivity assistant.

Generate a short and helpful expense notification for the user.

USER:
${userName || "User"}

EXPENSE INFORMATION:

Current monthly spending:
₹${totalExpense.toFixed(2)}

Monthly budget:
₹${monthlyBudget.toFixed(2)}

Budget used:
${percentage.toFixed(1)}%

Alert threshold:
${threshold}%

RULES:

1. Keep the message concise.
2. Be friendly and useful.
3. Currency must be INR.
4. Do not invent information.
5. Do not use Markdown.
6. Do not use bullet points.
7. Do not mention Gemini or AI.
8. Do not mention internal systems.
9. Do not exaggerate.
10. Return ONLY the notification message.

Example:

You've used 86% of your monthly budget (₹8,580 of ₹10,000). Consider reviewing your recent spending to stay within your budget.
`;
};


exports.buildTaskOverduePrompt = ({
    userName,
    taskTitle,
    status,
    priority,
    dueDate,
}) => {

    return `
You are SkillBridge AI, a productivity assistant.

Generate a short and helpful overdue task reminder.

USER:
${userName || "User"}

TASK:

Title:
${taskTitle}

Status:
${status}

Priority:
${priority}

Due Date:
${dueDate}

RULES:

1. Keep the message concise.
2. Be friendly but direct.
3. Clearly mention that the task is overdue.
4. Mention the task title.
5. Mention the due date.
6. Do not invent information.
7. Do not use Markdown.
8. Do not use bullet points.
9. Do not mention Gemini or AI.
10. Do not mention internal systems.
11. Return ONLY the notification message.

Example:

Your task "Complete Frontend" is overdue. It was due on 20 Jul 2026 and is still in progress. Consider prioritizing it today.
`;
};