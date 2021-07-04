const moment = require("moment");
const { ObjectId } = require("mongoose").Types;
const { generateObjectId, processId, generateDate } = require("../../helpers");
const _ = require("lodash");
const set = require("set-value");

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

const expenseStats = async (parent, args, { models, userId, user }) => {
  const months = 6;
  const startMonth = moment()
    .subtract(months, "months")
    .startOf("month")
    .toDate();
  const data = await models.Expense.find({
    userId,
    date: {
      $gte: startMonth,
    },
  }).sort({ date: 1 });

  const monthlyOverview = {};
  const categoryTotal = {};
  data.forEach((item) => {
    const { date, amount, expenseTypeId } = item;

    const expenseList = _.get(user, "expenseTypes", []);
    const expenseType = _.find(expenseList, { _id: expenseTypeId }) || {};
    const expenseTypeLabel = expenseType.label;

    const [month, year] = moment(date).format("MMM-YY").split("-");
    const createdKey = `${month} ${year}`;

    const previousValue = _.get(
      monthlyOverview,
      [createdKey, expenseTypeLabel],
      0
    );
    set(
      monthlyOverview,
      [createdKey, expenseTypeLabel],
      previousValue + amount
    );

    categoryTotal[expenseTypeLabel] =
      (categoryTotal[expenseTypeLabel] || 0) + amount;
  });

  return { monthlyOverview, categoryTotal };
};

module.exports = {
  expenseQueryResolvers: {
    getExpensesByMonth,
    expenseStats,
  },
  expenseMutationResolvers: {
    createExpense,
    updateExpense,
    deleteExpense,
  },
};
