const mongoose = require("mongoose");

const Expense = require("../models/Expense")

const MonthlyBudget = require("../models/MonthlyBudget");


// ========================================
// CREATE / UPDATE MONTHLY BUDGET
// ========================================

exports.saveMonthlyBudget = async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            month,
            year,
            income,
            budget,
            categoryBudgets,
        } = req.body;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: "Month and year are required",
            });
        }

        const monthlyBudget =
            await MonthlyBudget.findOneAndUpdate(
                {
                    user: userId,
                    month,
                    year,
                },
                {
                    user: userId,
                    month,
                    year,
                    income: income || 0,
                    budget: budget || 0,
                    categoryBudgets:
                        categoryBudgets || {},
                },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                }
            );

        res.status(200).json({
            success: true,
            message: "Monthly budget saved successfully",
            data: monthlyBudget,
        });

    } catch (error) {

        console.error(
            "Save Monthly Budget Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to save monthly budget",
        });
    }
};


// ========================================
// GET MONTHLY BUDGET
// ========================================

exports.getMonthlyBudget = async (req, res) => {
    try {

        const userId = req.user.id;

        const currentDate = new Date();

        const month =
            Number(req.query.month) ||
            currentDate.getMonth() + 1;

        const year =
            Number(req.query.year) ||
            currentDate.getFullYear();

        const monthlyBudget =
            await MonthlyBudget.findOne({
                user: userId,
                month,
                year,
            }).lean();

        res.status(200).json({
            success: true,
            data: monthlyBudget || {
                month,
                year,
                income: 0,
                budget: 0,
                categoryBudgets: {},
            },
        });

    } catch (error) {

        console.error(
            "Get Monthly Budget Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to get monthly budget",
        });
    }
};

exports.getMonthlySpending = async (req, res) => {

    try {

        const userId =
            new mongoose.Types.ObjectId(
                req.user.id
            );

        const month =
            Number(req.query.month);

        const year =
            Number(req.query.year);


        if (
            !month ||
            !year ||
            month < 1 ||
            month > 12
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Valid month and year are required",
            });

        }


        /*
        |--------------------------------------------------------------------------
        | Selected Month
        |--------------------------------------------------------------------------
        */

        const startDate =
            new Date(
                year,
                month - 1,
                1
            );


        /*
        |--------------------------------------------------------------------------
        | First Day Of Next Month
        |--------------------------------------------------------------------------
        */

        const endDate =
            new Date(
                year,
                month,
                1
            );


        console.log(
            "========== MONTHLY SPENDING =========="
        );

        console.log(
            "User:",
            req.user.id
        );

        console.log(
            "Month:",
            month
        );

        console.log(
            "Year:",
            year
        );

        console.log(
            "Start:",
            startDate
        );

        console.log(
            "End:",
            endDate
        );


        /*
        |--------------------------------------------------------------------------
        | Calculate Total
        |--------------------------------------------------------------------------
        */

        const result =
            await Expense.aggregate([

                {
                    $match: {

                        user: userId,

                        date: {
                            $gte: startDate,
                            $lt: endDate,
                        },

                    },
                },

                {
                    $group: {

                        _id: null,

                        totalSpent: {
                            $sum: "$amount",
                        },

                        transactionCount: {
                            $sum: 1,
                        },

                    },
                },

            ]);


        const totalSpent =
            result[0]?.totalSpent || 0;


        const transactionCount =
            result[0]?.transactionCount || 0;


        console.log(
            "Total Spent:",
            totalSpent
        );

        console.log(
            "Transactions:",
            transactionCount
        );


        res.status(200).json({

            success: true,

            month,

            year,

            totalSpent,

            transactionCount,

        });


    } catch (error) {

        console.error(
            "Monthly Spending Error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                error.message,

        });

    }

};