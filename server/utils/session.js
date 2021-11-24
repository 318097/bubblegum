const sessionModel = require("../models/session.model");

const createNewSession = ({ userId, source, authMethod, token }) =>
  sessionModel.create({
    userId,
    source,
    authMethod,
    token,
  });

const getSessionStatus = ({ userId, token }) =>
  sessionModel.findOne({
    userId,
    token,
  });

module.exports = { createNewSession, getSessionStatus };
