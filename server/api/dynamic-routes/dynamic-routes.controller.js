const { processId } = require("../../utils/common");

exports.controllerHOC = (config) => {
  const { Model } = config;

  const getAllEntities = async (req, res) => {
    const { userId } = req;

    const result = await Model.find({
      userId,
    });
    res.send({ result });
  };

  const getEntityById = async (req, res) => {
    const { userId } = req;
    const { id } = req.params;

    const result = await Model.findOne({
      // userId:processId(userId)
      userId,
      _id: id,
    });
    res.send({ result });
  };

  const createEntity = async (req, res) => {
    const { source, userId } = req;

    const result = await Model.create({
      ...req.body,
      source,
      userId,
    });

    res.send({ result });
  };

  const updateEntity = async (req, res) => {
    const { userId } = req;
    const { id } = req.params;

    const result = await Model.findOneAndUpdate(
      {
        _id: processId(id),
        userId: processId(userId),
      },
      { $set: { ...req.body } }
    );
    res.send({ result });
  };

  const deleteEntity = async (req, res) => {
    const { userId } = req;
    const { id } = req.params;

    const result = await Model.delete({
      _id: processId(id),
      userId: processId(userId),
    });

    res.send({ result });
  };

  return {
    getAllEntities,
    getEntityById,
    createEntity,
    updateEntity,
    deleteEntity,
  };
};
