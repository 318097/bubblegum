import _ from "lodash";
import mongoose from "mongoose";
import modelEntityMap from "../models.js";

const isId = (value) => mongoose.Types.ObjectId.isValid(value);
const toId = (value) => new mongoose.Types.ObjectId(value);

const getBusinessQuery = (businessId, extra = {}) => ({
  _id: isId(businessId) ? toId(businessId) : null,
  deleted: false,
  ...extra,
});

const getContentModel = (req, res) => {
  const model = modelEntityMap["businessContent"][req.params.resourceType];
  if (!model) {
    res.status(404).send({ error: "BUSINESS_RESOURCE_NOT_FOUND" });
    return null;
  }
  return model;
};

const getBusinessOr404 = async (req, res, extra = {}) => {
  const business = await modelEntityMap["circle"]
    .findOne(getBusinessQuery(req.params.businessId, extra))
    .lean();
  if (!business) res.status(404).send({ error: "BUSINESS_NOT_FOUND" });
  return business;
};

async function listContent(req, res) {
  const model = getContentModel(req, res);
  if (!model) return;
  const business = await getBusinessOr404(req, res, { archived: false });
  if (!business) return;

  const data = await model
    .find({ businessId: business._id, deleted: false })
    .sort({ createdAt: -1 })
    .lean();
  res.send({ data });
}

async function getContent(req, res) {
  const model = getContentModel(req, res);
  if (!model) return;
  const business = await getBusinessOr404(req, res, { archived: false });
  if (!business) return;
  if (!isId(req.params.contentId))
    return res.status(404).send({ error: "CONTENT_NOT_FOUND" });

  const data = await model
    .findOne({
      _id: toId(req.params.contentId),
      businessId: business._id,
      deleted: false,
    })
    .populate("businessId")
    .lean();
  if (!data) return res.status(404).send({ error: "CONTENT_NOT_FOUND" });
  res.send({ data });
}

async function createContent(req, res) {
  const model = getContentModel(req, res);
  if (!model) return;
  const business = await getBusinessOr404(req, res, {
    userId: req.user._id,
    archived: false,
  });
  if (!business) return;

  const data = await model.create({
    ..._.omit(req.body, ["_id", "businessId", "deleted"]),
    businessId: business._id,
  });
  res.status(201).send({ data });
}

async function updateContent(req, res) {
  const model = getContentModel(req, res);
  if (!model) return;
  const business = await getBusinessOr404(req, res, {
    userId: req.user._id,
    archived: false,
  });
  if (!business) return;
  if (!isId(req.params.contentId))
    return res.status(404).send({ error: "CONTENT_NOT_FOUND" });

  const data = await model
    .findOneAndUpdate(
      {
        _id: toId(req.params.contentId),
        businessId: business._id,
        deleted: false,
      },
      { $set: _.omit(req.body, ["_id", "businessId", "deleted"]) },
      { new: true, runValidators: true },
    )
    .lean();
  if (!data) return res.status(404).send({ error: "CONTENT_NOT_FOUND" });
  res.send({ data });
}

async function deleteContent(req, res) {
  const model = getContentModel(req, res);
  if (!model) return;
  const business = await getBusinessOr404(req, res, {
    userId: req.user._id,
    archived: false,
  });
  if (!business) return;
  if (!isId(req.params.contentId))
    return res.status(404).send({ error: "CONTENT_NOT_FOUND" });

  const data = await model
    .findOneAndUpdate(
      {
        _id: toId(req.params.contentId),
        businessId: business._id,
        deleted: false,
      },
      { $set: { deleted: true } },
      { new: true },
    )
    .lean();
  if (!data) return res.status(404).send({ error: "CONTENT_NOT_FOUND" });
  res.status(204).send();
}

export { listContent, getContent, createContent, updateContent, deleteContent };
