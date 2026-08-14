const express = require("express");

const router = express.Router();

const {
    saveMonthlyBudget,
    getMonthlyBudget,
    getMonthlySpending,
} = require("../controllers/budgetController");

const {
    protect,
} = require("../middleware/authmiddleware");


router.get(
    "/monthly",
    protect,
    getMonthlyBudget
);

router.get("/spending",protect,getMonthlySpending);

router.post(
    "/monthly",
    protect,
    saveMonthlyBudget
);




module.exports = router;