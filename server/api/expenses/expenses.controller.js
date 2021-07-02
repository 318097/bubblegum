const mongoose = require("mongoose");
const moment = require("moment");

const Model = require("./expenses.model");

const { ObjectId } = mongoose.Types;

exports.getExpensesByMonth = async (req, res) => {
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
    {
      $sort: { date: -1 },
    },
  ]);
  res.send({ expenses: result });
};

exports.createExpense = async (req, res) => {
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
  res.send({ result });
};

exports.updateExpense = async (req, res) => {
  const { ...expense } = req.body;
  const { id: expenseId } = req.params;
  const result = await Model.findOneAndUpdate(
    { _id: expenseId },
    { $set: expense }
  );
  res.send({ result });
};

exports.deleteExpense = async (req, res) => {
  const expenseId = req.params.id;
  const result = await Model.findOneAndDelete({ _id: ObjectId(expenseId) });
  res.send({ result });
};
