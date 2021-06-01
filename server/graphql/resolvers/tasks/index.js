const getAllTasks = async (_, args, ctx) => {
  const result = await ctx.models.Task.aggregate([
    { $match: { userId: ctx.user._id } },
    // {
    //   $group: { _id: '$type', 'todos': { $push: '$$ROOT' } }
    // },
    // { $replaceRoot: { newRoot: { $arrayToObject: [[{ k: '$_id', v: '$todos' }]] } } },
  ]);
  return result;
};

const getTaskById = async (_, args, ctx) => {
  const result = await ctx.models.Task.find({
    userId: ctx.user._id,
    _id: args.id,
  });
  return result;
};

module.exports = {
  taskQueryResolvers: {
    getAllTasks,
    getTaskById,
  },
  taskMutationResolvers: {},
};
