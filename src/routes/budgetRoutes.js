const express = require("express");

const router = express.Router();

const {
    saveMonthlyBudget,
    getMonthlyBudget,
} = require("../controllers/budgetController");

const {
    protect,
} = require("../middleware/authmiddleware");


router.get(
    "/monthly",
    protect,
    getMonthlyBudget
);


router.post(
    "/monthly",
    protect,
    saveMonthlyBudget
);


module.exports = router;