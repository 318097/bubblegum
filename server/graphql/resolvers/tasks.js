const moment = require("moment");
const { ObjectId } = require("mongoose").Types;

const getAllTasks = async (_, args, { models, user }) => {
  const result = await models.Task.aggregate([
    { $match: { userId: user._id } },
    // {
    //   $group: { _id: '$type', 'todos': { $push: '$$ROOT' } }
    // },
    // { $replaceRoot: { newRoot: { $arrayToObject: [[{ k: '$_id', v: '$todos' }]] } } },
  ]);
  return result;
};

const getTaskById = async (_, args, { models, user }) => {
  const result = await models.Task.find({
    userId: user._id,
    _id: args.id,
  });
  return result;
};

const createTask = async (_, args, { models, user }) => {
  const { task, type, frequency } = args.input;

  let data;
  if (type === "WEEKLY") {
    const weekNo = moment().week();
    data = {
      stamps: { [`week-${weekNo}`]: [] },
      frequency,
    };
  }

  const result = await models.Task.create({
    task,
    type,
    userId: user._id,
    ...args.input,
    ...data,
  });

  return result;
};

const updateTask = async (_, args, { models }) => {
  const { _id } = args.input;
  const result = await models.Task.findOneAndUpdate(
    {
      _id,
    },
    {
      $set: args.input,
    },
    { new: true }
  );
  return result;
};

const stampTask = async (_, args, { models }) => {
  const { date, type, todoId } = args.input;

  let expression;
  if (type === "WEEKLY") {
    const weekNo = moment(date).week();
    const week = `week-${weekNo}`;
    expression = {
      $addToSet: {
        [`stamps.${week}`]: moment(date).toDate(),
      },
    };
  } else {
    expression = {
      $set: {
        status: "COMPLETE",
        completionDate: date,
      },
    };
  }

  const result = await models.Task.findOneAndUpdate(
    {
      _id: ObjectId(todoId),
    },
    {
      ...expression,
    }
  );

  return result;
};

const deleteTask = async (_, args, { models }) => {
  const { _id } = args.input;
  const result = await models.Task.findOneAndDelete({
    _id,
  });
  return result;
};

module.exports = {
  taskQueryResolvers: {
    getAllTasks,
    getTaskById,
  },
  taskMutationResolvers: {
    createTask,
    updateTask,
    stampTask,
    deleteTask,
  },
};
