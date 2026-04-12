import { getSession } from "./session.js";
import logger from "./logger.js";

const isDisabledAccount = (status) => ["SUSPENDED", "DELETED"].includes(status);

const isVerifiedAccount = (verified) => !!verified;

const verifyAccountStatus = async (req, callSource = "NOT_LOGIN") => {
  const { token, status, userId, verified } = req;
  logger.log({ token, status, userId });

  if (isDisabledAccount(status)) throw new Error(`ACCOUNT_${status}`);
  // if (!isVerifiedAccount(verified)) throw new Error("ACCOUNT_NOT_VERIFIED");

  if (callSource !== "LOGIN" && token) {
    // do not check session when invoked from login
    const session = await getSession({ userId, token });
    const { status } = session || {};
    if (status === "REVOKED") throw new Error("CREDENTIALS_REVOKED");
    else if (status !== "LOGGED_IN") throw new Error("JWT_TOKEN_EXPIRED");
  }
};

export { verifyAccountStatus };
