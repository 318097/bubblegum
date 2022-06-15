const { generateSlugV2 } = require("../../utils/common");

exports.tagsMiddleware = {
  parseInputForCreateEntity: (body) => ({
    ...body,
    value: generateSlugV2(body.label),
  }),
};
