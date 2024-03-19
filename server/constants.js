const ACCOUNT_STATUS = [
  "INIT", // just created. Not verified yet
  "ACTIVE", // verified and in working condition
  "SUSPENDED", // temporarily blocked/suspended for some reason
  "DELETED", // soft delete
];

const USER_TYPES = ["ADMIN", "USER"];
const VERIFICATION_METHODS = ["LOGIN", "GOOGLE"];
const TAG_MODULE_NAMES = [
  "EXPENSE_TYPES",
  "EXPENSE_CATEGORIES",
  "EXPENSE_SOURCES",
  "EXPENSE_GROUPS",
  "COLLECTION",
];

const MODULE_TYPES = ["TIMELINE", "COLLECTION"];

module.exports = {
  TAG_MODULE_NAMES,
  ACCOUNT_STATUS,
  USER_TYPES,
  VERIFICATION_METHODS,
  MODULE_TYPES,
};
