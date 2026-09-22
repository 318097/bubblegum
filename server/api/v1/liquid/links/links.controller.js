import modelEntityMap from "../models.js";
import mongoose from "mongoose";

async function createOrUpdateLink(req, res) {
  const { _id } = req.user;

  const link = {
    ...req.body,
    userId: _id,
    collectionId: req.params.collectionId,
    slug: req.body.slug,
    deleted: false,
    archived: false,
    isBubblegumServer: true,
  };
  const result = await modelEntityMap["lynks"].findOneAndUpdate(
    { _id: req.body._id || new mongoose.Types.ObjectId() },
    {
      $set: link,
    },
    {
      upsert: true,
      new: true,
    },
  );

  res.send(result);
}

async function deleteLink(req, res) {
  const { linkId, collectionId } = req.params;
  const { _id: userId } = req.user;

  const result = await modelEntityMap["lynks"].findOneAndUpdate(
    {
      _id: linkId,
      userId,
      collectionId,
    },
    { $set: { deleted: true } },
  );
  res.send({ result });
}

async function getLynksByCollectionId(req, res) {
  const { _id } = req.user;

  const result = await modelEntityMap["lynks"].aggregate([
    {
      $match: {
        userId: _id,
        deleted: false,
        // collectionId: req.params.collectionId,
      },
    },
  ]);

  res.send(result);
}

export { createOrUpdateLink, deleteLink, getLynksByCollectionId };
