const { ObjectId } = require("mongoose").Types;
const _ = require("lodash");
const { getKeysBasedOnSource } = require("./utils/products");
const FireboardProjectsModel = require("./api/fireboard/fireboard.project.model");

const generateObjectId = () => new ObjectId();

const isObjectId = (id) => /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i.test(id);

const processId = (id) => (isObjectId(id) ? ObjectId(id) : id);

const generateDate = (date) =>
  (date ? new Date(date) : new Date()).toISOString();

const getKey = (id) => (isObjectId(id) ? "_id" : "slug");

const isSearchId = (search) => /^\d+$/.test(search.trim());

const generateSlug = ({ title = "", seperator = "-", prevSlug }) => {
  const slug = title
    .trim()
    .replace(/-/, " ")
    .replace(/\//, "-")
    .replace(/&/, "and")
    .replace(/[^a-zA-Z0-9\-\s]/gi, "")
    .replace(/\s+/gi, seperator)
    .toLowerCase();
  const timestamp = prevSlug
    ? prevSlug.split(seperator).pop()
    : new Date().getTime();

  return slug ? `${slug}${seperator}${timestamp}` : "";
};

const generateResourceName = ({
  index,
  liveId,
  slug,
  resources = [],
  fileNames = [],
  suffix,
  action,
}) => {
  let prefix = "",
    input,
    id;
  if (action === "CREATE_RESOURCE") {
    prefix = "R";
    input = resources;
    id = index;
  } else {
    input = fileNames;
    id = liveId;
  }

  const nextId = _.get(input, "length", 0) + 1;
  const _suffix = suffix ? `_${suffix}` : "";

  return `${prefix}${id}-${slug}-${nextId}${_suffix}`;
};

const extractUserData = async (req) => {
  const { user, source } = req;
  const basic = _.pick(user, [
    "name",
    "email",
    "_id",
    "username",
    "appStatus",
    "lastLogin",
  ]);
  let result = {};
  switch (source) {
    case "FIREBOARD":
      result["fireboardProjects"] = await FireboardProjectsModel.find({
        userId: user._id,
      });
      break;
    default: {
      const keysBasedOnSource = getKeysBasedOnSource(req.source);
      result = _.pick(user, keysBasedOnSource);
      break;
    }
  }

  return { ...basic, ...result };
};

module.exports = {
  getKey,
  generateResourceName,
  generateSlug,
  isSearchId,
  isObjectId,
  processId,
  extractUserData,
  generateObjectId,
  generateDate,
};
