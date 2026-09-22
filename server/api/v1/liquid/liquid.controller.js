import _ from "lodash";
import modelEntityMap from "./models.js";

async function getAllEntities(req, res) {
  const { entityType } = req.params;

  if (entityType === "alerts") {
    const alerts = await modelEntityMap["alerts"].find({
      type: "alerts",
      deleted: false,
      userId: req.user._id,
    });

    res.send(alerts);
  } else {
    const collection = modelEntityMap[entityType];
    const entities = await collection.find({
      deleted: false,
      userId: req.user._id,
    });

    res.send(entities);
  }
}

async function getEntityById(req, res) {
  const { entityId, entityType } = req.params;

  const query = {
    deleted: false,
    userId: req.user._id,
    _id: entityId,
  };

  let entity;
  if (entityType === "alerts") {
    entity = await modelEntityMap["alerts"].find({
      ...query,
      entityType: "alerts",
    });
  } else if (entityType === "activities") {
    entity = await modelEntityMap["activities"].find({
      ...query,
    });
  }

  res.send(entity);
}

async function createEntity(req, res) {
  const { _id } = req.user;
  const { entityType } = req.params;

  const entity = {
    userId: _id,
    ...req.body,
  };

  if (entityType === "dynamic") {
    entity["api"] = `/notion/vocab`;
    entity["apiParams"] = {
      cursor: undefined,
    };
    entity["refreshDuration"] = 60 * 60 * 8; // 8 hours
  }

  const result = await modelEntityMap[entityType].create(entity);

  res.send(result);
}

async function updateEntity(req, res) {
  const { entityId, entityType } = req.params;

  const { _id: userId } = req.user;

  const collection = modelEntityMap[entityType];
  const result = await collection.findOneAndUpdate(
    {
      _id: entityId,
      userId,
    },
    { $set: { ..._.omit(req.body, "_id") } },
  );
  res.send({ result });
}

async function deleteEntity(req, res) {
  const { entityId, entityType } = req.params;
  const { _id: userId } = req.user;

  const collection = modelEntityMap[entityType];

  const result = await collection.findOneAndUpdate(
    {
      _id: entityId,
      userId,
    },
    { $set: { deleted: true } },
  );
  res.send({ result });
}

async function resolveShortLink(req, res) {
  const { path } = req.params;

  const [collection, ...slug] = path.split("::");

  const lynkCollection = await modelEntityMap["links"].findOne({
    label: collection.trim().toLowerCase(),
    // collectionId: req.params.collectionId,
  });

  const result = await modelEntityMap["lynks"].findOne({
    collectionId: lynkCollection._id,
    slug: `${slug.join("/")}`,
    // collectionId: req.params.collectionId,
  });

  // TODO: limit the content that is sent back, and also add analytics for the same
  res.send(result);
}

export {
  getAllEntities,
  createEntity,
  getEntityById,
  updateEntity,
  deleteEntity,
  resolveShortLink,
};
