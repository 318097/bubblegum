const { ObjectId } = require("mongoose").Types;
const _ = require("lodash");
const { getKeysBasedOnSource } = require("./products");
const FireboardProjectsModel = require("../api/fireboard/fireboard.project.model");
const TagsModel = require("../modules/tags/tags.model");

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

const generateObjectId = () => new ObjectId();

const isObjectId = (id) => OBJECT_ID_REGEX.test(id);

const processId = (id) =>
  isObjectId(id) && ObjectId.isValid(id) ? ObjectId(id) : id;

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

const getTags = async ({ userId, moduleName, source }) =>
  TagsModel.find({
    userId,
    moduleName,
    source,
  });

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
  const BASIC_USER_KEYS = [
    "name",
    "email",
    "_id",
    "username",
    "appStatus",
    "lastLogin",
    "accountStatus",
  ];
  const basic = _.pick(user, BASIC_USER_KEYS);
  let result = {};
  switch (source) {
    case "FIREBOARD":
      result["fireboardProjects"] = await FireboardProjectsModel.find({
        userId: user._id,
      });
      break;
    case "OCTON":
      result["expenseTypes"] = await getTags({
        userId: user._id,
        moduleName: "EXPENSE_TYPES",
        source,
      });
      result["expenseApps"] = await getTags({
        userId: user._id,
        moduleName: "EXPENSE_APPS",
        source,
      });
      result["expenseSources"] = await getTags({
        userId: user._id,
        moduleName: "EXPENSE_SOURCES",
        source,
      });
      break;
    case "NOTEBASE":
    case "FLASH": {
      const notebase = user.notebase.map(async (collection) => {
        const tags = await getTags({
          userId: user._id,
          moduleName: "COLLECTION",
          moduleId: collection._id,
          source,
        });

        return {
          ...collection,
          tags,
        };
      });

      result["notebase"] = await Promise.all(notebase);
      break;
    }
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
