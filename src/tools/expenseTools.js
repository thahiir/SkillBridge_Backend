const mongoose = require("mongoose");
const Expense = require("../models/Expense");

/*
|--------------------------------------------------------------------------
| Gemini Tool Declarations
|--------------------------------------------------------------------------
*/

const expenseToolDeclarations = [
    {
        name: "get_expenses",

        description:
            "Get expenses belonging to the authenticated SkillBridge user. " +
            "Use this when the user asks about their expenses, spending, " +
            "transactions, categories, or payment methods.",

        parameters: {
            type: "object",

            properties: {
                category: {
                    type: "string",

                    enum: [
                        "Food",
                        "Transport",
                        "Shopping",
                        "Bills",
                        "Entertainment",
                        "Education",
                        "Healthcare",
                        "Travel",
                        "Others",
                    ],

                    description:
                        "Optional expense category filter.",
                },

                paymentMethod: {
                    type: "string",

                    enum: [
                        "Cash",
                        "UPI",
                        "Debit Card",
                        "Credit Card",
                        "Net Banking",
                        "Wallet",
                    ],

                    description:
                        "Optional payment method filter.",
                },
            },
        },
    },

    {
        name: "get_expense_summary",

        description:
            "Get a summary of the authenticated user's expenses including " +
            "total spending, transaction count, average expense, highest expense, " +
            "lowest expense, and spending by category.",

        parameters: {
            type: "object",

            properties: {
                month: {
                    type: "integer",

                    description:
                        "Optional month number from 1 to 12.",
                },

                year: {
                    type: "integer",

                    description:
                        "Optional four digit year.",
                },
            },
        },
    },

    {
        name: "create_expense",

        description:
            "Create a new expense for the authenticated SkillBridge user. " +
            "Use this when the user explicitly asks to add or record an expense.",

        parameters: {
            type: "object",

            properties: {
                title: {
                    type: "string",

                    description:
                        "Expense title.",
                },

                amount: {
                    type: "number",

                    description:
                        "Expense amount in Indian Rupees.",
                },

                category: {
                    type: "string",

                    enum: [
                        "Food",
                        "Transport",
                        "Shopping",
                        "Bills",
                        "Entertainment",
                        "Education",
                        "Healthcare",
                        "Travel",
                        "Others",
                    ],
                },

                paymentMethod: {
                    type: "string",

                    enum: [
                        "Cash",
                        "UPI",
                        "Debit Card",
                        "Credit Card",
                        "Net Banking",
                        "Wallet",
                    ],
                },

                date: {
                    type: "string",

                    description:
                        "Optional expense date in YYYY-MM-DD format.",
                },

                notes: {
                    type: "string",

                    description:
                        "Optional expense notes.",
                },
            },

            required: [
                "title",
                "amount",
            ],
        },
    },
];

/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

const formatExpense = (expense) => ({
    id: expense._id.toString(),

    title: expense.title,

    amount: expense.amount,

    category: expense.category,

    paymentMethod: expense.paymentMethod,

    date: expense.date
        ? expense.date.toISOString().split("T")[0]
        : null,

    notes: expense.notes || "",

    createdAt: expense.createdAt
        ? expense.createdAt.toISOString()
        : null,
});

/*
|--------------------------------------------------------------------------
| Get Expenses
|--------------------------------------------------------------------------
*/

const getExpenses = async ({
    userId,
    category,
    paymentMethod,
}) => {
    const filter = {
        user: userId,
    };

    if (category) {
        filter.category = category;
    }

    if (paymentMethod) {
        filter.paymentMethod = paymentMethod;
    }

    const expenses = await Expense.find(filter)
        .sort({
            date: -1,
            createdAt: -1,
        })
        .limit(50)
        .select(
            "title amount category paymentMethod date notes createdAt"
        )
        .lean();

    return {
        success: true,

        count: expenses.length,

        expenses: expenses.map(formatExpense),
    };
};

/*
|--------------------------------------------------------------------------
| Expense Summary
|--------------------------------------------------------------------------
*/

const getExpenseSummary = async ({
    userId,
    month,
    year,
}) => {
    const match = {
        user: new mongoose.Types.ObjectId(userId),
    };

    /*
    |--------------------------------------------------------------------------
    | Optional Date Filter
    |--------------------------------------------------------------------------
    */

    if (month && year) {
        const startDate = new Date(
            Number(year),
            Number(month) - 1,
            1
        );

        const endDate = new Date(
            Number(year),
            Number(month),
            1
        );

        match.date = {
            $gte: startDate,
            $lt: endDate,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Summary
    |--------------------------------------------------------------------------
    */

    const summaryResult = await Expense.aggregate([
        {
            $match: match,
        },

        {
            $group: {
                _id: null,

                totalExpense: {
                    $sum: "$amount",
                },

                totalTransactions: {
                    $sum: 1,
                },

                averageExpense: {
                    $avg: "$amount",
                },

                highestExpense: {
                    $max: "$amount",
                },

                lowestExpense: {
                    $min: "$amount",
                },
            },
        },
    ]);

    /*
    |--------------------------------------------------------------------------
    | Category Summary
    |--------------------------------------------------------------------------
    */

    const categorySummary = await Expense.aggregate([
        {
            $match: match,
        },

        {
            $group: {
                _id: "$category",

                total: {
                    $sum: "$amount",
                },

                transactions: {
                    $sum: 1,
                },
            },
        },

        {
            $sort: {
                total: -1,
            },
        },
    ]);

    const summary = summaryResult[0] || {
        totalExpense: 0,
        totalTransactions: 0,
        averageExpense: 0,
        highestExpense: 0,
        lowestExpense: 0,
    };

    return {
        success: true,

        summary: {
            totalExpense:
                Math.round(
                    (summary.totalExpense || 0) * 100
                ) / 100,

            totalTransactions:
                summary.totalTransactions || 0,

            averageExpense:
                Math.round(
                    (summary.averageExpense || 0) * 100
                ) / 100,

            highestExpense:
                summary.highestExpense || 0,

            lowestExpense:
                summary.lowestExpense || 0,

            categories: categorySummary.map(
                (item) => ({
                    category: item._id,

                    total: item.total,

                    transactions:
                        item.transactions,
                })
            ),
        },
    };
};

/*
|--------------------------------------------------------------------------
| Create Expense
|--------------------------------------------------------------------------
*/

const createExpense = async ({
    userId,
    title,
    amount,
    category,
    paymentMethod,
    date,
    notes,
}) => {
    if (!title || !title.trim()) {
        return {
            success: false,
            message: "Expense title is required.",
        };
    }

    if (
        amount === undefined ||
        amount === null ||
        Number.isNaN(Number(amount)) ||
        Number(amount) < 0
    ) {
        return {
            success: false,
            message:
                "A valid non-negative expense amount is required.",
        };
    }

    let parsedDate;

    if (date) {
        parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return {
                success: false,
                message:
                    "Invalid expense date. Use YYYY-MM-DD format.",
            };
        }
    }

    const expense = await Expense.create({
        title: title.trim(),

        amount: Number(amount),

        category: category || "Others",

        paymentMethod:
            paymentMethod || "Cash",

        date: parsedDate || new Date(),

        notes: notes
            ? notes.trim()
            : "",

        user: userId,
    });

    return {
        success: true,

        message:
            "Expense created successfully.",

        expense: formatExpense(expense),
    };
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports = {
    expenseToolDeclarations,

    getExpenses,
    getExpenseSummary,
    createExpense,
};