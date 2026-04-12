import _ from "lodash";
import { generateSlugV2 } from "../../utils/common.js";
import TagsModel from "./tags.model.js";

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

export { generateDefaultTagInfo, createTags };
