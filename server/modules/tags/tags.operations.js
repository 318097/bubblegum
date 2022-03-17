const _ = require("lodash");
const TagsModel = require("./tags.model");

const generateDefaultTagInfo = ({
  obj,
  user,
  source,
  moduleName,
  moduleId,
}) => {
  if (!obj.label) {
    obj["label"] = obj.name;
  }

  const newObj = {
    ...obj,
    value: obj.label ? obj.label.replace(/\s/, "_").toLowerCase() : undefined,
    source,
    userId: user._id,
    moduleName,
    moduleId,
    parentTagId: obj.parentId,
  };

  delete newObj.parentId;
  delete newObj.name;
  delete newObj.count;

  return newObj;
};

const createTags = (input, others) => {
  const tags = input.map((obj) => generateDefaultTagInfo({ obj, ...others }));
  return TagsModel.create(tags);
};

module.exports = { generateDefaultTagInfo, createTags };
