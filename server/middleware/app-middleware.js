const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const override = require("method-override");
const _ = require("lodash");
const { APP_LIST } = require("../constants");

const attachExternalSource = (req, res, next) => {
  const externalSource = _.get(req, "headers.external-source");
  req.source = externalSource;
  req.validSource = APP_LIST.includes(externalSource);
  next();
};

module.exports = function (app) {
  app.use(morgan("dev"));
  app.use(express.json()); // for parsing application/json
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(override());
  app.use(attachExternalSource);
};
