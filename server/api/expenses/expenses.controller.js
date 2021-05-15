const mongoose = require("mongoose");
const moment = require("moment");

const Model = require("./expenses.model");
const UserModel = require("../user/user.model");

const { ObjectId } = mongoose.Types;

exports.getAllExpenseTypes = async (req, res, next) =>
  res.send({ expenseTypes: req.user.expenseTypes });

exports.getAllExpenses = async (req, res, next) => {
  const result = await Model.find({ userId: req.user._id }, null, {
    sort: { date: -1 },
  });
  res.send({ expenses: result });
};

exports.getMonthlyExpense = async (req, res, next) => {
  const { month } = req.params;
  const { year = moment().year() } = req.query;

  const monthObject = moment(`${month}-${year}`, "MM-YYYY");
  const monthStart = monthObject.startOf("month").toDate();
  const monthEnd = monthObject.endOf("month").toDate();

  const result = await Model.aggregate([
    {
      $match: {
        userId: ObjectId(req.user._id),
        date: {
          $gte: monthStart,
          $lte: monthEnd,
        },
      },
    },

    // {
    //   $unwind: { path: "$expenseTypes", preserveNullAndEmptyArrays: true },
    // },
    // {
    //   $lookup: {
    //     from: "expenses",
    //     localField: "expenseTypes._id",
    //     foreignField: "expenseSubTypeId",
    //     as: "expense",
    //   },
    // },
    // {
    //   $unwind: { path: "$expense", preserveNullAndEmptyArrays: true },
    // },
    // {
    //   $project: {
    //     _id: "$expense._id",
    //     expenseSubTypeId: "$expense.expenseSubTypeId",
    //     amount: "$expense.amount",
    //     userId: "$expense.userId",
    //     date: "$expense.date",
    //     expenseType: "$expenseTypes.name",
    //     expenseTypeId: "$expense.expenseTypeId",
    //     message: "$expense.message",
    //   },
    // },
    {
      $sort: { date: -1 },
    },
  ]);
  res.send({ expenses: result });
};

exports.createExpenseType = async (req, res, next) => {
  const { name } = req.body;
  const result = await UserModel.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $push: {
        expenseTypes: {
          name,
          _id: new ObjectId(),
          count: 0,
        },
      },
    }
  );
  res.send({ result });
};

exports.createExpense = async (req, res, next) => {
  const {
    expenseSubTypeId,
    amount,
    message,
    expenseTypeId,
    date = moment().toString(),
  } = req.body;
  const result = await Model.create({
    expenseSubTypeId,
    amount,
    message,
    expenseTypeId,
    userId: req.user._id,
    date,
  });
  // updateCount({ userId: req.user._id, expenseSubTypeId, value: 1 });
  res.send({ result });
};

exports.updateExpenseType = async (req, res, next) => {
  const { name } = req.body;
  const expenseSubTypeId = req.params.id;
  const result = await UserModel.findOneAndUpdate(
    {
      _id: req.user._id,
      "expenseTypes._id": expenseSubTypeId,
    },
    {
      $set: {
        "expenseTypes.$.name": name,
      },
    }
  );
  res.send({ result });
};

exports.updateExpense = async (req, res, next) => {
  const { ...expense } = req.body;
  const { id: expenseId } = req.params;
  const result = await Model.findOneAndUpdate(
    { _id: expenseId },
    { $set: expense }
  );
  res.send({ result });
};

exports.deleteExpenseType = async (req, res, next) => {
  const expenseSubTypeId = req.params.id;
  const result = await UserModel.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    {
      $pull: {
        expenseTypes: {
          _id: ObjectId(expenseSubTypeId),
        },
      },
    }
  );
  res.send({ result });
};

exports.deleteExpense = async (req, res, next) => {
  const expenseId = req.params.id;
  const result = await Model.findOneAndDelete({ _id: ObjectId(expenseId) });
  // updateCount({
  //   userId: req.user._id,
  //   expenseSubTypeId: result.expenseSubTypeId,
  //   value: -1
  // });
  res.send({ result });
};
