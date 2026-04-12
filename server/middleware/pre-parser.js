import express from "express";
import cors from "cors";
import morgan from "morgan";
import _ from "lodash";
import logger from "../utils/logger.js";
import { PRODUCT_LIST } from "../utils/products.js";
import { getToken } from "../utils/authentication.js";

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

const requestLogFormat = (tokens, req, res) => {
  const status = tokens.status(req, res);
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);

  const request = {};

  if (req.params) request.params = req.params;

  if (req.query) request.query = req.query;

  if (req.body) request.body = req.body;

  const response = [`${method} ${url} ${status}`];

  if (Object.keys(request).length > 0)
    response.push(`Request: ${JSON.stringify(request, undefined, 2)}`);

  return response.join("\n");
};

export default function (app) {
  // app.use(
  //   morgan(requestLogFormat, {
  //     stream: {
  //       write: (message) => logger.log(message.trim()),
  //     },
  //   }),
  // );
  app.use(morgan("dev"));
  // setting limit for toby/bookmark upload, as the default value is 100kb
  app.use(express.json({ limit: "1mb" })); // for parsing application/json
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(appendSourceInfo);
}
