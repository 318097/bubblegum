const _ = require("lodash");
const { ObjectId } = require("mongoose").Types;
const { processId, generateDate } = require("../../helpers");
const Model = require("./user.model");

exports.updateSettings = async (req, res) => {
  const { user, query, body } = req;
  const { action, key } = query;

  if (!action || !key) throw new Error("'action' & 'key' are required");

  const _id = processId(body._id);

  const queryObj = { _id: user._id };
  let dbObj;

  switch (action) {
    case "CREATE": {
      const data = {
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

  const result = await Model.findOneAndUpdate(queryObj, dbObj, {
    new: true,
  }).lean();

  res.send({ result });
};
