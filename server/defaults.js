const { generateObjectId, generateDate } = require("./helpers");
const { APP_INFO, DEFAULT_EXPENSE_TYPES } = require("./constants");

const generateDefaultAppStatus = () => {
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

const generateDefaultTimeline = ({
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

const generateDefaultExpenseTypes = () => {
  return DEFAULT_EXPENSE_TYPES.map((item) => ({
    ...item,
    _id: generateObjectId(),
    default: true,
    isRoot: true,
    parentId: null,
  }));
};

const generateDefaultUserState = (req, { token }) => {
  const { source, body } = req;
  const { authMethod } = body;
  const verified = authMethod === "GOOGLE";

  return {
    source,
    userType: "USER",
    timeline: generateDefaultTimeline({ _default: true }),
    expenseTypes: generateDefaultExpenseTypes(),
    appStatus: generateDefaultAppStatus(),
    accountStatus: updateAccountStatus(undefined, {
      verified,
      source,
      authMethod,
      token,
    }),
  };
};

module.exports = {
  generateDefaultUserState,
  generateDefaultTimeline,
  updateAccountStatus,
};
