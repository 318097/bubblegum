const ACCOUNT_STATUS = [
  "INIT", // just created. Not verified yet
  "ACTIVE", // verified and in working condition
  "SUSPENDED", // temporarily blocked/suspended for some reason
  "DELETED", // soft delete
];

const USER_TYPES = ["ADMIN", "USER"];
const VERIFICATION_METHODS = ["LOGIN", "GOOGLE"];

module.exports = { ACCOUNT_STATUS, USER_TYPES, VERIFICATION_METHODS };
