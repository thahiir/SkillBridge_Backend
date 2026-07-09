const express = require("express");

const router = express.Router();

const {
    createExpense,
    getExpenses,
    getExpense,
    updateExpense,
    deleteExpense,
    getExpenseSummary,
    getMonthlyExpenses,
    getCategoryExpense,
} = require("../controllers/expenseController");

const { protect } = require("../middleware/authmiddleware");

const validate = require("../middleware/validate");

const { expenseValidation } = require("../validators/expenseValidation");

// Create Expense
router.post(
    "/",
    protect,
    expenseValidation,
    validate,
    createExpense
);

// Get All Expenses
router.get(
    "/",
    protect,
    getExpenses
);
//expense summary,monthly,expensecategory
router.get("/summary",protect,getExpenseSummary);
router.get("/monthly",protect,getMonthlyExpenses);
router.get("/category",protect,getCategoryExpense);
// Get Single Expense
router.get(
    "/:id",
    protect,
    getExpense
);

// Update Expense
router.put(
    "/:id",
    protect,
    expenseValidation,
    validate,
    updateExpense
);

// Delete Expense
router.delete(
    "/:id",
    protect,
    deleteExpense
);


module.exports = router;