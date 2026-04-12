import _ from "lodash";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import {
  processId,
  generateDate,
  extractUserData,
} from "../../utils/common.js";
import Model from "./user.model.js";
import { getKeysBasedOnSource } from "../../utils/products.js";

async function updateSettings(req, res) {
  const { user, query, body } = req;
  const { action, key } = query;

  const keysBasedOnSource = getKeysBasedOnSource(req.source);
  if (!keysBasedOnSource.includes(key))
    throw new Error("No permission for this key");

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

  const updatedUser = await Model.findOneAndUpdate(queryObj, dbObj, {
    new: true,
  }).lean();

  const filteredContent = await extractUserData({
    source: req.source,
    user: updatedUser,
  });

  res.send({ result: filteredContent });
}

async function updateAppSettings(req, res) {
  const keysBasedOnSource = getKeysBasedOnSource(req.source);
  const data = _.pick(req.body, keysBasedOnSource);

  const update = await Model.findOneAndUpdate(
    { _id: req.user._id },
    { $set: data },
    { new: true },
  );
  res.send(update);
}

async function getProfileById(profileId) {
  const profile = await Model.findOne({ _id: profileId }).lean();
  return profile;
}

async function getProfile(req, res) {
  const { id } = req.params;
  // TODO: return the no of alerts, activites created by the user and last active time
  const profile = await this.getProfileById(id);
  res.send(profile);
}

export { updateSettings, updateAppSettings, getProfileById, getProfile };
