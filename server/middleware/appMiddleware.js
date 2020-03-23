const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const override = require("method-override");

const attachExternalSource = (req, res, next) => {
  if (req.headers && req.headers.hasOwnProperty("external-source"))
    req.source = req.headers["external-source"];

  next();
};

module.exports = function(app) {
  app.use(morgan("dev"));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cors());
  app.use(override());
  app.use(attachExternalSource);
};
