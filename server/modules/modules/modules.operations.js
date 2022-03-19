const _ = require("lodash");
const ModelsModel = require("./modules.model");

const createModules = (input) => {
  return ModelsModel.create(input);
};

module.exports = { createModules };
