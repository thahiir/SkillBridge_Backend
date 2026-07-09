const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Expense title is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    category: {
      type: String,
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
      default: "Others",
    },

    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "UPI",
        "Debit Card",
        "Credit Card",
        "Net Banking",
        "Wallet",
      ],
      default: "Cash",
    },

    date: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      maxlength: 500,
      default: "",
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

module.exports = mongoose.model("Expense", expenseSchema);