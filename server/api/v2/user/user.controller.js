import Model from "./user.model.js";

async function getProfileById(profileId) {
  const profile = await Model.findOne({ _id: profileId }).lean();
  return profile;
}

async function getProfile(req, res) {
  const { id } = req.params;
  // TODO: return the no of alerts, activites created by the user and last active time
  const profile = await getProfileById(id);
  res.send(profile);
}

export { getProfile, getProfileById };
