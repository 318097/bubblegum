const _ = require("lodash");
const { generateObjectId, generateDate } = require("./helpers");
const { APP_INFO, defaultExpenseTypes } = require("./constants");

const generateAppStatusDefault = () => {
  return Object.entries(APP_INFO)
    .filter(([, { active }]) => active)
    .reduce(
      (result, [name]) => ({ ...result, [name]: { status: "INIT" } }),
      {}
    );
};

const generateTimelineDefault = () => {
  return {
    name: "Default",
    default: true,
    _id: generateObjectId(),
    createdAt: generateDate(),
  };
};

const generateExpenseTypesDefault = () => {
  return defaultExpenseTypes.map((item) => ({
    ...item,
    _id: generateObjectId(),
    default: true,
    isRoot: true,
    parentId: null,
  }));
};

const generateDefaultState = (req) => {
  const defaultState = {
    source: req.source,
    userType: "USER",
    timeline: generateTimelineDefault(),
    expenseTypes: generateExpenseTypesDefault(),
    appStatus: generateAppStatusDefault(),
    verified: _.get(req, "body.authMethod") === "GOOGLE",
  };

  return defaultState;
};

module.exports = { generateDefaultState };
