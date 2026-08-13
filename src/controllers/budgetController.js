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