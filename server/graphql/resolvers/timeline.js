const moment = require("moment");
const { generateObjectId, processId, generateDate } = require("../../helpers");
const _ = require("lodash");

const getTimeline = async (_, args, { models, userId }) => {
  const { page, groupId } = args.input;

  const aggregation = { userId };

  if (groupId) aggregation["groupId"] = groupId;

  const result = await models.Timeline.find(aggregation).sort({
    date: -1,
    _id: -1,
  });

  return result;
};

const createTimelinePost = async (_, args, { models, userId }) => {
  const result = await models.Timeline.create({
    userId,
    ...args.input,
  });

  return result;
};

const updateTimelinePost = async (_, args, { models, userId }) => {
  const { _id, ...data } = args.input;
  const result = await models.Timeline.findOneAndUpdate(
    { userId, _id },
    {
      $set: data,
    },
    { new: true }
  );
  return result;
};

// const toggleFavoriteExpense = async (_, args, { models, userId }) => {
//   const { _id, status } = args.input;
//   const result = await models.Timeline.findOneAndUpdate(
//     { userId, _id },
//     {
//       $set: status,
//     },
//     { new: true }
//   );
//   return result;
// };

const deleteTimelinePost = async (_, args, { models, userId }) => {
  const { _id } = args.input;
  const result = await models.Timeline.findOneAndDelete({
    userId,
    _id,
  });
  return result;
};

// const expenseStats = async (parent, args, { models, userId, user }) => {
//   const months = 6;
//   const startMonth = moment()
//     .subtract(months, "months")
//     .startOf("month")
//     .toDate();
//   const data = await models.Timeline.find({
//     userId,
//     date: {
//       $gte: startMonth,
//     },
//   }).sort({ date: 1 });

//   const monthlyOverview = {};
//   const categoryTotal = {};
//   data.forEach((item) => {
//     const { date, amount, expenseTypeId } = item;

//     const expenseList = _.get(user, "expenseTypes", []);
//     const expenseType = _.find(expenseList, { _id: expenseTypeId }) || {};
//     const expenseTypeLabel = expenseType.label;

//     const [month, year] = moment(date).format("MMM-YY").split("-");
//     const createdKey = `${month} ${year}`;

//     const previousValue = _.get(
//       monthlyOverview,
//       [createdKey, expenseTypeLabel],
//       0
//     );
//     set(
//       monthlyOverview,
//       [createdKey, expenseTypeLabel],
//       previousValue + amount
//     );

//     categoryTotal[expenseTypeLabel] =
//       (categoryTotal[expenseTypeLabel] || 0) + amount;
//   });

//   return { monthlyOverview, categoryTotal };
// };

module.exports = {
  timelineQueryResolvers: {
    getTimeline,
    // expenseStats,
  },
  timelineMutationResolvers: {
    createTimelinePost,
    updateTimelinePost,
    // toggleFavoriteExpense,
    deleteTimelinePost,
  },
};
