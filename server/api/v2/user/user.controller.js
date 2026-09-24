import _ from "lodash";
import modelEntityMap from "../models.js";

// Fields a user is allowed to change on their own profile
const NON_EDITABLE_FIELDS = [
  "_id",
  "uid",
  "email",
  "role",
  "createdAt",
  "updatedAt",
  "source",
];

async function getProfileById(profileId) {
  const profile = await modelEntityMap.user.findOne({ _id: profileId }).lean();
  return profile;
}

async function getProfile(req, res) {
  const { id } = req.params;
  // TODO: return the no of alerts, activites created by the user and last active time
  const profile = await getProfileById(id);
  res.send(profile);
}

async function updateProfile(req, res) {
  const { _id: userId } = req.user;

  const updates = _.omit(req.body, NON_EDITABLE_FIELDS);
  if (_.isEmpty(updates))
    return res.status(400).send({ error: "NO_VALID_FIELDS_TO_UPDATE" });

  try {
    console.log("userId, updates::-", userId, updates);

    const profile = await modelEntityMap.user
      .findOneAndUpdate(
        { _id: userId },
        { $set: updates },
        { new: true, runValidators: true },
      )
      .lean();
    if (!profile) return res.status(404).send({ error: "USER_NOT_FOUND" });

    res.send(profile);
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.username)
      return res.status(409).send({ error: "USERNAME_TAKEN" });
    throw err;
  }
}

export { getProfile, getProfileById, updateProfile };
