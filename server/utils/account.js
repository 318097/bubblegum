const _ = require("lodash");
// const { getToken } = require("./authentication"); // throws error
const { getSessionStatus } = require("./session");

const ACCOUNT_STATUS = [
  "INIT", // just created. Not verified yet
  "ACTIVE", // verified and in working condition
  "SUSPENDED", // temporarily blocked/suspended for some reason
  "DELETED", // soft delete
];

const isDisabledAccount = (status) => ["SUSPENDED", "DELETED"].includes(status);

const verifyAccountStatus = async (req) => {
  const token = _.get(req, "token");
  const userId = _.get(req, "user._id");
  const status = _.get(req, "user.accountStatus.status", "ACTIVE");
  if (isDisabledAccount(status)) throw new Error(status);

  if (token) {
    const session = await getSessionStatus({ userId, token });
    if (!session || session.status !== "ACTIVE") throw new Error("INVALID_JWT");
  }
};

module.exports = { ACCOUNT_STATUS, verifyAccountStatus };
