import _ from "lodash";
import ModelsModel from "./modules.model.js";

const createModules = (input) => {
  return ModelsModel.create(input);
};

export { createModules };
