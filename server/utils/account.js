import { getSession, sessionV2 } from "./session.js";
import logger from "./logger.js";

const isDisabledAccount = (status) => ["SUSPENDED", "DELETED"].includes(status);

const isVerifiedAccount = (verified) => !!verified;

// Bound to one session collection, like the session helpers: v1 checks
// bubblegum sessions, `verifyAccountStatusV2` checks circle sessions.
const createVerifyAccountStatus =
  (getSession) =>
  async (req, callSource = "NOT_LOGIN") => {
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

const verifyAccountStatus = createVerifyAccountStatus(getSession);
const verifyAccountStatusV2 = createVerifyAccountStatus(sessionV2.getSession);

export { verifyAccountStatus, verifyAccountStatusV2 };
