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
    await createNotification({
        title: "Expense Updated",
        message: `${expense.title} has been updated.`,
        type: "EXPENSE",
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

exports.deleteExpense = async (req, res) => {
  try {

    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    await createNotification({
        title: "Expense Deleted",
        message: `${expense.title} has been deleted.`,
        type: "EXPENSE",
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
      message: "Expense deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
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

