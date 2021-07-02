const moment = require("moment");
const { ObjectId } = require("mongoose").Types;
const { generateObjectId, processId, generateDate } = require("../../helpers");

const getExpensesByMonth = async (_, args, { models, user }) => {
  const { month, year } = args.input;

  const monthObject = moment(`${month}-${year}`, "MM-YYYY");
  const monthStart = monthObject.startOf("month").toDate();
  const monthEnd = monthObject.endOf("month").toDate();

  const result = await models.Expense.find({
    userId: user._id,
    date: {
      $gte: monthStart,
      $lte: monthEnd,
    },
  }).sort({
    _id: -1,
  });

  return result;
};

const createExpense = async (_, args, { models, userId }) => {
  const { date = generateDate() } = args.input;

  const result = await models.Expense.create({
    userId,
    date,
    ...args.input,
  });

  return result;
};

const updateExpense = async (_, args, { models, userId }) => {
  const { _id, ...data } = args.input;
  const result = await models.Expense.findOneAndUpdate(
    { userId, _id },
    {
      $set: data,
    },
    { new: true }
  );
  return result;
};

const deleteExpense = async (_, args, { models, userId }) => {
  const { _id } = args.input;
  const result = await models.Expense.findOneAndDelete({
    userId,
    _id,
  });
  return result;
};

module.exports = {
  expenseQueryResolvers: {
    getExpensesByMonth,
  },
  expenseMutationResolvers: {
    createExpense,
    updateExpense,
    deleteExpense,
  },
};
