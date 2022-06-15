const { generateSlugV2 } = require("../../utils/common");

module.exports = {
  parseInputForCreateEntity: (body) => ({
    ...body,
    value: generateSlugV2(body.label),
  }),
};
