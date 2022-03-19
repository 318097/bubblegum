const _ = require("lodash");
const { processId } = require("../../utils/common");

module.exports = (config) => {
  const { Model } = config;

  const defaultQuery = {
    deleted: false,
    visible: true,
  };

  const getAllEntities = async (req, res) => {
    const { userId } = req;

    const result = await Model.find({
      ...defaultQuery,
      userId,
    });
    res.send({ result });
  };

  const getEntityById = async (req, res) => {
    const { userId } = req;
    const { id } = req.params;

    const result = await Model.findOne({
      // userId:processId(userId)
      ...defaultQuery,
      userId,
      _id: id,
    });
    res.send({ result });
  };

  const createEntity = async (req, res) => {
    const { source, userId } = req;
    const obj = {
      ...defaultQuery,
      ...req.body,
      source,
      userId,
    };

    const result = await Model.create(obj);

    res.send({ result });
  };

  const updateEntity = async (req, res) => {
    const { userId } = req;
    const { id } = req.params;

    const result = await Model.findOneAndUpdate(
      {
        ...defaultQuery,
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

    const result = await Model.findOneAndUpdate(
      {
        ...defaultQuery,
        _id: processId(id),
        userId: processId(userId),
      },
      { $set: { deleted: true } }
    );

    res.send({ result });
  };

  const entityOperations = async (req, res) => {
    const { query, body } = req;
    const { action } = query;
    const { _id } = body;

    req.params.id = _id;
    req.body = _.omit(body, [
      "_id",
      "createdAt",
      "updatedAt",
      "source",
      "userId",
    ]);

    switch (action) {
      case "CREATE":
        return await createEntity(req, res);
      case "UPDATE":
        return await updateEntity(req, res);
      case "DELETE":
        return await deleteEntity(req, res);
      default:
        return res.status(401).send("INVALID OPERATION");
    }
  };

  return {
    getAllEntities,
    getEntityById,
    createEntity,
    updateEntity,
    deleteEntity,
    entityOperations,
  };
};
