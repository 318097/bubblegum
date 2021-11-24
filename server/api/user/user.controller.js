const _ = require("lodash");
const { ObjectId } = require("mongoose").Types;
const {
  processId,
  generateDate,
  extractUserData,
} = require("../../utils/common");
const Model = require("./user.model");
const { getKeysBasedOnSource } = require("../../utils/products");
const { generateDefaultTimeline } = require("./user.utils");

const getDefaultValue = ({ key, name }) => {
  if (key === "timeline") {
    return generateDefaultTimeline({ key, name });
  }
};

exports.updateSettings = async (req, res) => {
  const { user, query, body } = req;
  const { action, key } = query;

  if (!action || !key) throw new Error("'action' & 'key' are required");

  const _id = processId(body._id);

  const queryObj = { _id: user._id };
  let dbObj;

  switch (action) {
    case "CREATE": {
      const defaultValue = getDefaultValue({ ...body, key });
      const data = defaultValue
        ? defaultValue
        : {
            ...body,
            _id: new ObjectId(),
            createdAt: generateDate(),
          };
      dbObj = {
        $push: { [key]: data },
      };
      break;
    }
    case "UPDATE": {
      queryObj[`${key}._id`] = _id;
      delete body._id;

      const objUpdate = {};

      Object.entries(body).forEach(([objKey, objValue]) => {
        objUpdate[`${key}.$.${objKey}`] = objValue;
      });

      dbObj = {
        $set: objUpdate,
      };
      break;
    }
    case "DELETE": {
      dbObj = {
        $pull: { [key]: { _id } },
      };
      break;
    }
    default:
      throw new Error("Invalid 'action'");
  }

  const updatedUser = await Model.findOneAndUpdate(queryObj, dbObj, {
    new: true,
  }).lean();

  const filteredContent = await extractUserData({
    source: req.source,
    user: updatedUser,
  });

  res.send({ result: filteredContent });
};

exports.updateAppSettings = async (req, res) => {
  const keysBasedOnSource = getKeysBasedOnSource(req.source);
  const data = _.pick(req.body, keysBasedOnSource);

  const update = await Model.findOneAndUpdate(
    { _id: req.user._id },
    { $set: data },
    { new: true }
  );
  res.send(update);
};
