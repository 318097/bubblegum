const { getSessionStatus } = require("./session");

const isDisabledAccount = (status) => ["SUSPENDED", "DELETED"].includes(status);

const isInvalidatedJWT = async ({ userId, token }) => {
  const session = await getSessionStatus({ userId, token });
  return !session || session.status !== "ACTIVE";
};

const verifyAccountStatus = async ({ token, status, userId }) => {
  if (isDisabledAccount(status)) throw new Error(`ACCOUNT_${status}`);
  if (token && (await isInvalidatedJWT({ userId, token })))
    throw new Error("INVALID_TOKEN");
};

module.exports = { verifyAccountStatus };
