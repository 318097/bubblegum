const { generateObjectId, generateDate } = require("./helpers");
const { APP_INFO, defaultExpenseTypes } = require("./constants");

const generateDefaultState = (req) => {
  const appStatus = Object.entries(APP_INFO)
    .filter(([, { active }]) => active)
    .reduce(
      (result, [name]) => ({ ...result, [name]: { status: "INIT" } }),
      {}
    );

  const expenseTypes = defaultExpenseTypes.map((item) => ({
    ...item,
    _id: generateObjectId(),
    default: true,
    isRoot: true,
    parentId: null,
  }));

  const timeline = {
    name: "Default",
    default: true,
    _id: generateObjectId(),
    createdAt: generateDate(),
  };

  const defaultState = {
    source: req.source,
    timeline,
    expenseTypes,
    appStatus,
    userType: "USER",
  };

  return defaultState;
};

module.exports = { generateDefaultState };
