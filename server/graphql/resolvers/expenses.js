const moment = require("moment");
const { ObjectId } = require("mongoose").Types;
const {
  generateObjectId,
  processId,
  generateDate,
} = require("../../utils/common");
const _ = require("lodash");
const set = require("set-value");

const getExpensesByMonth = async (__, args, { models, user }) => {
  const {
    month,
    year,
    minAmount,
    expenseSubTypeId = [],
    maxAmount,
    startMonth,
    endMonth,
  } = args.input;
  const query = {
    userId: user._id,
  };

  if (!_.isEmpty(expenseSubTypeId)) {
    query["expenseSubTypeId"] = { $in: expenseSubTypeId };
  }

  if (minAmount || maxAmount) {
    query["amount"] = {};
    if (minAmount) {
      query["amount"]["$gte"] = minAmount;
    }

    if (maxAmount) {
      query["amount"]["$lte"] = maxAmount;
    }
  }

  if (startMonth) {
    const monthStart = moment(startMonth, "MM-YYYY").startOf("month").toDate();
    const monthEnd = moment(endMonth, "MM-YYYY").endOf("month").toDate();
    query["date"] = {
      $gte: monthStart,
    };
    if (endMonth) {
      query["date"]["$lt"] = monthEnd;
    }
  } else {
    const monthObject = moment(`${month}-${year}`, "MM-YYYY");
    const monthStart = monthObject.startOf("month").toDate();
    const monthEnd = monthObject.endOf("month").toDate();
    query["date"] = {
      $gte: monthStart,
      $lte: monthEnd,
    };
  }

  const result = await models.Expense.find(query).sort({
    date: -1,
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

const toggleFavoriteExpense = async (_, args, { models, userId }) => {
  const { _id, status } = args.input;
  const result = await models.Expense.findOneAndUpdate(
    { userId, _id },
    {
      $set: { favorite: status },
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
  // const {
  //   month,
  //   year,
  //   minAmount,
  //   expenseSubTypeId,
  //   maxAmount,
  //   startMonth,
  //   endMonth,
  // } = args.input;

  const months = 6;
  const last6StartMonth = moment()
    .subtract(months, "months")
    .startOf("month")
    .toDate();
  const expenses = await models.Expense.find({
    userId,
    date: {
      $gte: last6StartMonth,
    },
    excluded: { $ne: true },
  }).sort({ date: 1 });

  const monthlyOverview = {};
  const expenseTypes = _.get(user, "expenseTypes", []);

  expenses.forEach((expense) => {
    const { date, amount, expenseSubTypeId } = expense;

    const { label: expenseTypeLabel, visible } =
      _.find(expenseTypes, { _id: expenseSubTypeId }) || {};

    if (visible) {
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
    }
  });

  return { monthlyOverview };
};

module.exports = {
  expenseQueryResolvers: {
    getExpensesByMonth,
    expenseStats,
  },
  expenseMutationResolvers: {
    createExpense,
    updateExpense,
    toggleFavoriteExpense,
    deleteExpense,
  },
};
