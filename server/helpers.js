const { ObjectId } = require("mongoose").Types;
const _ = require("lodash");
const DotProjectsModel = require("./api/dot/dot.project.model");

const generateObjectId = () => new ObjectId();

const isObjectId = (id) => /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i.test(id);

const processId = (id) => (isObjectId(id) ? ObjectId(id) : id);

const generateDate = () => new Date().toISOString();

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

const generateName = ({
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
  const basic = _.pick(user, ["name", "email", "_id", "username", "appStatus"]);
  let result = {};
  switch (source) {
    case "DOT":
      result["dotProjects"] = await DotProjectsModel.find({ userId: user._id });
      break;
    case "NOTES_APP":
    case "FLASH":
      result = _.pick(user, ["notesApp"]);
      break;
    case "ATOM":
      result = _.pick(user, ["expenseTypes", "timeline"]);
      break;
    case "CODEDROPS":
      result = _.pick(user, ["bookmarkedPosts"]);
      break;
  }

  return { ...basic, ...result };
};

module.exports = {
  getKey,
  generateName,
  generateSlug,
  isSearchId,
  isObjectId,
  processId,
  extractUserData,
  generateObjectId,
  generateDate,
};
