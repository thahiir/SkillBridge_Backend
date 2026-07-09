const { body } = require("express-validator");

exports.expenseValidation = [

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Expense title is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Title must be between 3 and 100 characters"),

    body("amount")
        .notEmpty()
        .withMessage("Amount is required")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be greater than 0"),

    body("category")
        .optional()
        .isIn([
            "Food",
            "Transport",
            "Shopping",
            "Bills",
            "Entertainment",
            "Education",
            "Healthcare",
            "Travel",
            "Others",
        ])
        .withMessage("Invalid expense category"),

    body("paymentMethod")
        .optional()
        .isIn([
            "Cash",
            "UPI",
            "Debit Card",
            "Credit Card",
            "Net Banking",
            "Wallet",
        ])
        .withMessage("Invalid payment method"),

    body("notes")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Notes cannot exceed 500 characters"),

    body("date")
        .optional()
        .isISO8601()
        .withMessage("Invalid date format"),
];