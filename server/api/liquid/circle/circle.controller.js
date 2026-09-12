import _ from "lodash";
import { CircleModel } from "./circle.model.js";
import { getKey, processId, generateSlug } from "../../../utils/common.js";

const USER_PROJECT = {
  _id: 1,
  name: 1,
  username: 1,
  photoURL: 1,
};

const getAggregationFilters = (req) => {
  const {
    search,
    businessType,
    category,
    tags = [],
    city,
    state,
    limit = 25,
    page = 1,
    sortFilter = "createdAt",
    sortOrder = "DESC",
  } = req.query;

  const aggregation = {
    deleted: false,
    archived: false,
  };

  if (businessType) aggregation.businessType = businessType;
  if (category) aggregation.category = category;
  if (city) aggregation["address.city"] = new RegExp(city, "gi");
  if (state) aggregation["address.state"] = new RegExp(state, "gi");
  if (tags.length) aggregation.tags = { $in: [].concat(tags) };

  if (search) {
    const regex = new RegExp(search, "gi");
    aggregation.$or = [
      { name: regex },
      { description: regex },
      { category: regex },
    ];
  }

  const sort = { [sortFilter]: sortOrder === "ASC" ? 1 : -1 };

  return { aggregation, sort, page: Number(page), limit: Number(limit) };
};

// list other businesses, excludes the requesting user's own circles when logged in
async function getExploreFeed(req, res) {
  const { aggregation, sort, page, limit } = getAggregationFilters(req);

  if (req.userId) aggregation.userId = { $ne: req.userId };

  const [circles, count] = await Promise.all([
    CircleModel.find(aggregation)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", USER_PROJECT)
      .lean(),
    CircleModel.countDocuments(aggregation),
  ]);

  res.send(circles);
}

async function getMyBusinessProfile(req, res) {
  const circles = await CircleModel.findOne({
    userId: req.user._id,
  }).lean();

  res.send(circles);
}

// public single business view, resolvable by _id or slug
async function getBusinessById(req, res) {
  const { circleId } = req.params;
  const key = getKey(circleId);

  const circle = await CircleModel.findOne({
    [key]: processId(circleId),
    deleted: false,
  })
    .populate("userId", USER_PROJECT)
    .lean();

  if (!circle) return res.status(404).send({ error: "CIRCLE_NOT_FOUND" });

  res.send(circle);
}

async function createBusinessEntity(req, res) {
  const { _id: userId } = req.user;
  const { name } = req.body;

  const circle = await CircleModel.create({
    ..._.omit(req.body, ["_id", "userId", "deleted", "archived"]),
    userId,
    slug: generateSlug({ title: name }),
  });

  res.send(circle);
}

async function updateBusinessEntity(req, res) {
  const { circleId } = req.params;
  const { _id: userId } = req.user;

  const circle = await CircleModel.findOne({
    _id: circleId,
    userId,
  });
  if (!circle) return res.status(404).send({ error: "CIRCLE_NOT_FOUND" });

  const updates = _.omit(req.body, ["_id", "userId", "deleted"]);
  if (updates.name && updates.name !== circle.name)
    updates.slug = generateSlug({ title: updates.name, prevSlug: circle.slug });

  const result = await CircleModel.findOneAndUpdate(
    { _id: circleId, userId },
    { $set: updates },
    { new: true },
  );

  res.send(result);
}

async function deleteBusinessEntity(req, res) {
  const { circleId } = req.params;
  const { _id: userId } = req.user;

  const result = await CircleModel.findOneAndUpdate(
    { _id: circleId, userId },
    { $set: { deleted: true } },
    { new: true },
  );

  if (!result) return res.status(404).send({ error: "CIRCLE_NOT_FOUND" });

  res.send({ result });
}

export {
  getExploreFeed,
  getMyBusinessProfile,
  getBusinessById,
  createBusinessEntity,
  updateBusinessEntity,
  deleteBusinessEntity,
};
