import mongoose from "mongoose";
import _ from "lodash";
import { getKeysBasedOnSource } from "./products.js";
import FireboardProjectsModel from "../api/fireboard/fireboard.project.model.js";
import TagsModel from "../modules/tags/tags.model.js";
import ModulesModel from "../modules/modules/modules.model.js";

const { ObjectId } = mongoose.Types;
const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

const generateObjectId = () => new ObjectId();

const isObjectId = (id) => OBJECT_ID_REGEX.test(id);

const processId = (id) =>
  isObjectId(id) && ObjectId.isValid(id) ? new ObjectId(id) : id;

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

const getTags = async ({ userId, moduleName, source, moduleId }) =>
  TagsModel.find({
    userId,
    moduleName,
    source,
    moduleId,
  })
    .sort({ label: 1 })
    .lean();

const getModules = async ({ userId, moduleType, source }) =>
  ModulesModel.find({
    userId,
    moduleType,
    source,
  }).lean();

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

const getAppBasedInfo = async ({ user, source }) => {
  let result = {};
  switch (source) {
    case "FIREBOARD":
      result["fireboardProjects"] = await FireboardProjectsModel.find({
        userId: user._id,
      });
      break;
    case "NOTEBASE":
    case "FLASH": {
      const collections = await getModules({
        userId: user._id,
        moduleType: "COLLECTION",
        source: "NOTEBASE",
      });
      const notebase = collections.map(async (collection) => {
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
    default:
      break;
  }

  return result;
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

  const keysBasedOnSource = getKeysBasedOnSource(req.source);
  const sourceBasedInfo = _.pick(user, keysBasedOnSource);

  const appSpecificInfo = await getAppBasedInfo({ user, source });

  return { ...basic, ...sourceBasedInfo, ...appSpecificInfo };
};

const generateSlugV2 = (title = "") =>
  title
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/_+/g, "_");

const lowerCaseAndTrim = (input) => input.toLowerCase().trim();

export {
  getKey,
  generateResourceName,
  generateSlug,
  isSearchId,
  isObjectId,
  processId,
  extractUserData,
  generateObjectId,
  generateDate,
  getAppBasedInfo,
  generateSlugV2,
  lowerCaseAndTrim,
};
