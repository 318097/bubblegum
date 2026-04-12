import { generateSlugV2 } from "../../utils/common.js";

export default {
  parseInputForCreateEntity: (body) => ({
    ...body,
    value: generateSlugV2(body.label),
  }),
};
