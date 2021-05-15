const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const override = require("method-override");

const attachExternalSource = (req, res, next) => {
  if (req.headers && req.headers.hasOwnProperty("external-source"))
    req.source = req.headers["external-source"];

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
