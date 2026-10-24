import SessionModel, { SessionModelV2 } from "../models/session.model.js";
import { generateDate } from "./common.js";

// Session helpers bound to one session collection. The plain exports are v1
// (bubblegum); v2 auth uses `sessionV2` (circle).
const createSessionHelpers = (sessionModel) => {
  const startSession = ({ userId, source, authMethod, token }) =>
    sessionModel.create({
      userId,
      source,
      authMethod,
      token,
      loggedInAt: generateDate(),
    });

  const getSession = ({ userId, token }) =>
    sessionModel.findOne({
      userId,
      token,
    });

  // Matched by token alone: the logout routes aren't behind auth, so `userId`
  // isn't known there, and the token already identifies the session.
  const endSession = async ({ token }) => {
    if (!token) return null;
    return sessionModel.findOneAndUpdate(
      { token },
      { $set: { status: "LOGGED_OUT", loggedOutAt: generateDate() } },
    );
  };

  const revokeAllSessions = ({ userId }) =>
    sessionModel.updateMany({ userId }, { $set: { status: "REVOKED" } });

  return { startSession, getSession, endSession, revokeAllSessions };
};

const { startSession, getSession, endSession, revokeAllSessions } =
  createSessionHelpers(SessionModel);

const sessionV2 = createSessionHelpers(SessionModelV2);

export { startSession, getSession, endSession, revokeAllSessions, sessionV2 };
