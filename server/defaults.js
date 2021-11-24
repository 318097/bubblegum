const { generateObjectId, generateDate } = require("./helpers");
const { getProducts } = require("./utils/products");

const DEFAULT_EXPENSE_TYPES = [
  { key: "EXPENSE", label: "Expense", success: "DOWN", color: "watermelon" },
  { key: "BILLS", label: "Bills", success: "DOWN", color: "orange" },
  { key: "INVESTMENT", label: "Investment", success: "UP", color: "green" },
  { key: "INCOME", label: "Income", success: "DOWN", color: "orchid" },
];

const generateDefaultAppStatus = () => {
  return getProducts({ visibilityKey: "active" }).reduce(
    (result, { id }) => ({ ...result, [id]: { status: "INIT" } }),
    {}
  );
};

const updateAccountStatus = (
  obj = {},
  { verified, token, source, authMethod }
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
