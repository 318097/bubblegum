const moment = require("moment");
const { ObjectId } = require("mongoose").Types;
const { generateObjectId, processId } = require("../../helpers");

const getAllTasks = async (_, args, { models, user }) => {
  const result = await models.Task.find({ userId: user._id }).sort({
    _id: -1,
  });
  // const result = await models.Task.aggregate([
  // { $match: { userId: user._id } },
  // {
  //   $group: { _id: '$type', 'todos': { $push: '$$ROOT' } }
  // },
  // { $replaceRoot: { newRoot: { $arrayToObject: [[{ k: '$_id', v: '$todos' }]] } } },
  // ]);
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

  // let data;
  // if (type === "WEEKLY") {
  //   const weekNo = moment().week();
  //   data = {
  //     stamps: { [`week-${weekNo}`]: [] },
  //     frequency,
  //   };
  // }

  const result = await models.Task.create({
    task,
    type,
    userId: user._id,
    ...args.input,
    // ...data,
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
  const { date, type, _id, action, message, stampId } = args.input;

  let data = {};
  if (type === "PROGRESS") {
    if (action === "MARK") {
      data = {
        $addToSet: {
          stamps: {
            _id: generateObjectId(),
            date,
            message,
          },
        },
      };
    } else {
      data = {
        $pull: {
          stamps: { _id: processId(stampId) },
        },
      };
    }
  } else {
    data = {
      $set: {
        status: "COMPLETED",
        completionDate: date,
      },
    };
  }

  const result = await models.Task.findOneAndUpdate(
    {
      _id,
    },
    data
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
