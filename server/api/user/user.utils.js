const bcrypt = require("bcrypt");
const { generateObjectId, generateDate } = require("../../utils/common");
const { getProducts } = require("../../utils/products");

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

const generateDefaultExpenseTypes = () => {
  return DEFAULT_EXPENSE_TYPES.map((expenseType) => ({
    ...expenseType,
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
    appStatus: generateDefaultAppStatus(),
    accountStatus: updateAccountStatus(undefined, {
      verified,
      source,
      authMethod,
      token,
    }),
  };
};

const encryptPassword = (plainPassword) => {
  if (!plainPassword) return "";

  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plainPassword, salt);
};

const comparePassword = (plainPassword, hashedPassword) =>
  bcrypt.compareSync(plainPassword, hashedPassword);

module.exports = {
  encryptPassword,
  comparePassword,
  generateDefaultUserState,
  updateAccountStatus,
  generateDefaultExpenseTypes,
};
