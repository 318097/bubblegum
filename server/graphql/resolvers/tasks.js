const moment = require("moment");
const { ObjectId } = require("mongoose").Types;
const { generateObjectId, processId } = require("../../helpers");

const getAllTasks = async (_, args, { models, user }) => {
  const result = await models.Task.find({ userId: user._id }).sort({
    status: -1,
    createdAt: -1,
  });
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

  const result = await models.Task.create({
    task,
    type,
    userId: user._id,
    ...args.input,
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
  const { date, actionType, _id, action, message, subTaskId } = args.input;

  let data = {};
  if (actionType === "SUBTASK") {
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
          stamps: { _id: processId(subTaskId) },
        },
      };
    }
  } else {
    data = {
      $set: {
        status: "COMPLETED",
        completedOn: date,
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
