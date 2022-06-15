const _ = require("lodash");
const { generateSlugV2 } = require("../../utils/common");
const TagsModel = require("./tags.model");

const generateDefaultTagInfo = ({
  tagInfo,
  user = {},
  source,
  moduleName,
  moduleId,
}) => {
  return {
    ...tagInfo,
    value: generateSlugV2(tagInfo.label),
    userId: _.get(user, "_id"),
    source,
    moduleName,
    moduleId,
  };
};

const createTags = (tagsToGenerate, otherInfo) => {
  const tags = []
    .concat(tagsToGenerate)
    .map((tagInfo) => generateDefaultTagInfo({ tagInfo, ...otherInfo }));
  return TagsModel.create(tags);
};

module.exports = { generateDefaultTagInfo, createTags };
