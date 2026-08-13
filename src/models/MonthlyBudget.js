const mongoose = require("mongoose");

const monthlyBudgetSchema = new mongoose.Schema(
    {
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },

        year: {
            type: Number,
            required: true,
        },

        income: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        budget: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        categoryBudgets: {
            Food: {
                type: Number,
                default: 0,
                min: 0,
            },

            Transport: {
                type: Number,
                default: 0,
                min: 0,
            },

            Shopping: {
                type: Number,
                default: 0,
                min: 0,
            },

            Bills: {
                type: Number,
                default: 0,
                min: 0,
            },

            Entertainment: {
                type: Number,
                default: 0,
                min: 0,
            },

            Education: {
                type: Number,
                default: 0,
                min: 0,
            },

            Healthcare: {
                type: Number,
                default: 0,
                min: 0,
            },

            Travel: {
                type: Number,
                default: 0,
                min: 0,
            },

            Others: {
                type: Number,
                default: 0,
                min: 0,
            },
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// One financial record per user per month
monthlyBudgetSchema.index(
    {
        user: 1,
        month: 1,
        year: 1,
    },
    {
        unique: true,
    }
);

module.exports = mongoose.model(
    "MonthlyBudget",
    monthlyBudgetSchema
);