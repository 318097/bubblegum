import sessionModel from "../models/session.model.js";
import { generateDate } from "./common.js";

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

const endSession = ({ userId, token }) =>
  sessionModel.findOneAndUpdate(
    { userId, token },
    { $set: { status: "LOGGED_OUT", loggedOutAt: generateDate() } },
  );

const revokeAllSessions = ({ userId }) =>
  sessionModel.updateMany({ userId }, { $set: { status: "REVOKED" } });

export { startSession, getSession, endSession, revokeAllSessions };
