import express from "express";
import morgan from "morgan";
import cors from "cors";
import _ from "lodash";
import {PRODUCT_LIST} from "../utils/products.js";
import {getToken} from "../utils/authentication.js";

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

export default function (app) {
  app.use(morgan("dev"));
  // setting limit for toby/bookmark upload, as the default value is 100kb
  app.use(express.json({ limit: "1mb" })); // for parsing application/json
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(appendSourceInfo);
};
