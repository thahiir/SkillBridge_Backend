const Expense = require("../models/Expense");
const mongoose = require("mongoose");
const {createNotification,} = require("../services/notificationServices");

exports.createExpense = async (req, res) => {
  try {

    const expense = await Expense.create({
      ...req.body,
      user: new mongoose.Types.ObjectId(req.user.id),
    });
    await createNotification({
      title: "Expense Added",
      message: `₹${expense.amount} added under ${expense.category}.`,
      type: "EXPENSE",
      userId: new mongoose.Types.ObjectId(req.user.id),
      referenceId: expense._id,
      referenceModel: "Expense",
      sendEmail:true,
    });

    res.status(201).json({
      success: true,
      expense,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.getExpenses = async (req, res) => {
  try {
    const {
      search,
      category,
      paymentMethod,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const query = {
      user: new mongoose.Types.ObjectId(req.user.id),
    };

    // Search by title or notes
    if (search) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          notes: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Category Filter
    if (category) {
    query.category = {
        $regex: `^${category}$`,
        $options: "i",
    };
}

    // Payment Method Filter
    if (paymentMethod) {
    query.paymentMethod = {
        $regex: `^${paymentMethod}$`,
        $options: "i",
    };
}

    console.log("Logged User:", req.user.id);
    console.log("Mongo Query:", query);

    const totalExpenses = await Expense.countDocuments(query);

    const expenses = await Expense.find(query)
      .sort(sort || "-createdAt")
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalExpenses / limitNumber),
      totalExpenses,
      expenses,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getExpense = async (req, res) => {
  try {

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      expense,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

exports.updateExpense = async (req, res) => {
    try {

        const expense = await Expense.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id,
            },
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found",
            });
        }


        try {

            await createNotification({
                title: "Expense Updated",
                message: `${expense.title} has been updated.`,
                type: "EXPENSE",

                userId: new mongoose.Types.ObjectId(
                    req.user.id
                ),

                referenceId: expense._id,
                referenceModel: "Expense",

                sendEmail: true,
            });

        } catch (notificationError) {

            console.error(
                "Update Notification Error:",
                notificationError
            );

        }


        return res.status(200).json({
            success: true,
            expense,
        });

    } catch (error) {

        console.error(
            "Update Expense Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteExpense = async (req, res) => {
    try {

        console.log("========== DELETE EXPENSE ==========");
        console.log("Expense ID:", req.params.id);
        console.log("User ID:", req.user.id);

        const expense = await Expense.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found",
            });
        }

        // Save values before deleting
        const expenseId = expense._id;
        const expenseTitle = expense.title;
        const expenseAmount = expense.amount;

        // Delete expense
        await Expense.deleteOne({
            _id: expenseId,
        });

        console.log("Expense deleted successfully");


        // Create notification
        try {

            await createNotification({
                title: "Expense Deleted",
                message: `₹${expenseAmount} expense "${expenseTitle}" has been deleted.`,
                type: "EXPENSE",

                userId: new mongoose.Types.ObjectId(
                    req.user.id
                ),

                referenceId: expenseId,
                referenceModel: "Expense",

                sendEmail: true,
            });

            console.log(
                "Delete notification created successfully"
            );

        } catch (notificationError) {

            console.error(
                "Delete Notification Error:",
                notificationError
            );

            /*
             * Notification failure should NOT
             * make expense deletion fail.
             */
        }


        return res.status(200).json({
            success: true,
            message: "Expense deleted successfully",
        });

    } catch (error) {

        console.error(
            "========== DELETE EXPENSE ERROR =========="
        );

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete expense",
            error: error.message,
        });
    }
};

exports.getExpenseSummary = async(req,res) =>{
  try{

    const summary = await Expense.aggregate([
      {
        $match:{
          user:new mongoose.Types.ObjectId(req.user.id)
        }
      },
      {
        $group:{
          _id:null,
          totalExpense:{$sum:"$amount"},
          totalTransactions:{$sum:1},
          averageExpense:{$avg:"$amount"},
          highestExpense:{$max:"$amount"},
          lowestExpense:{$min:"$amount"}
        }
      }
    ]);

    res.status(200).json({
      success:true,
      summary:summary[0] || {
        totalExpense:0,
        totalTransactions:0,
        averageExpense:0,
        highestExpense:0,
        lowestExpense:0
      }

    });
  }
  catch(error){
    res.status(500).json({
      sucess:false,
      message:error.message
    })

  }
};

exports.getMonthlyExpenses = async(req,res) =>{
  try{

    const monthly = await Expense.aggregate([
      {
        $match:{
          user:new mongoose.Types.ObjectId(req.user.id)
        }
      },
      {
        $group:{
          _id:{
            month:{
              $month:"$date"
            }
          },
          total:{
            $sum:"$amount"
          }
        }
      },
      {
        $sort:{
          "_id.month":1
        }
      }
    ]);
    res.status(200).json({
      sucess:true,
      monthly
    });


  }catch(error){
    res.status(500).json({
      sucess:false,
      message:error.message
    })
  }
};

exports.getCategoryExpense = async(req,res) =>{
  try{
    const category = await Expense.aggregate([
      {
        $match:{
          user:new mongoose.Types.ObjectId(req.user.id)
        }
      },
      {
        $group:{
          _id:"$category",
          total:{
            $sum:"$amount"
          }
        }
      },
      {
        $sort:{
          total:-1
        }
      }
    ]);
    res.status(200).json({
      success:true,
      category
    })

  }catch(error){
    res.status(500).json({
      sucess:false,
      message:error.message
    })
  }
}

