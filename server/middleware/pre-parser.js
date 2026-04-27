import express from "express";
import cors from "cors";
import morgan from "morgan";
import _ from "lodash";
import * as Sentry from "@sentry/node";
import logger from "../utils/logger.js";
import { PRODUCT_LIST } from "../utils/products.js";
import { getToken } from "../utils/authentication.js";
import Mixpanel from "mixpanel";
import config from "../config.js";

let mp = null;

if (config.MIXPANEL_TOKEN) {
  mp = Mixpanel.init(config.MIXPANEL_TOKEN, {
    verbose: true,
  });
  logger.system(`Mixpanel initialized`);
}

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
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      // track Sentry API latency
      const responseTimeMs = Date.now() - start;
      Sentry.metrics.distribution("api.latency", responseTimeMs, {
        unit: "millisecond",
        attributes: { endpoint: req.path, method: req.method },
      });

      // Track Mixpanel event
      if (mp && !["/favicon.ico"].includes(req.originalUrl)) {
        const [endpoint] = req.originalUrl.split("?");
        const track = {
          endpoint,
          status: res.statusCode,
          method: req.method,
          source: req.source || "NA",
          distinct_id: req.user?.email,
        };
        // logger.info("Mixpanel track event:", track);
        mp.track("api_request", track, (err) => {
          if (err) logger.system("[Mixpanel]", err);
        });
      }
    });
    next();
  });
}
