const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const override = require("method-override");
const _ = require("lodash");
const { PRODUCT_LIST } = require("../utils/products");
const { getToken } = require("../utils/authentication");

const appendSourceInfo = (req, res, next) => {
  const externalSource = _.get(req, "headers.external-source");
  req.source = externalSource;
  req.validSource = PRODUCT_LIST.includes(externalSource);

  const token = getToken(req);
  if (token) {
    req.headers.authorization = `Bearer ${token}`;
    req.token = token;
  }

  next();
};

module.exports = function (app) {
  app.use(morgan("dev"));
  // setting limit for toby/bookmark upload, as the default value is 100kb
  app.use(express.json({ limit: "1mb" })); // for parsing application/json
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(override());
  app.use(appendSourceInfo);
};
