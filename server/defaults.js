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

const updateAccountStatus = (
  obj = { verified: false },
  { verified, token, source, authMethod = "LOGIN" }
) => {
  if (token) return { ...obj, verificationToken: token };

  if (!verified) return obj;

  return {
    verified,
    verifiedOn: generateDate(),
    verificationSource: source,
    verificationMethod: authMethod,
  };
};

const generateTimelineDefault = ({
  name = "Default",
  _default = false,
  ...rest
} = {}) => {
  return {
    name,
    // color: getRandomColor(),
    default: _default,
    _id: generateObjectId(),
    createdAt: generateDate(),
    ...rest,
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

const generateDefaultState = (req, { token }) => {
  const { source, body } = req;
  const { authMethod } = body;
  const verified = authMethod === "GOOGLE";

  const defaultState = {
    source,
    userType: "USER",
    timeline: generateTimelineDefault({ _default: true }),
    expenseTypes: generateExpenseTypesDefault(),
    appStatus: generateAppStatusDefault(),
    accountStatus: updateAccountStatus(undefined, {
      verified,
      source,
      authMethod,
      token,
    }),
  };

  return defaultState;
};

module.exports = {
  generateDefaultState,
  generateTimelineDefault,
  updateAccountStatus,
};
