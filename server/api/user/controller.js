const _ = require("lodash");
const Model = require("./model");
const signToken = require("../../auth/auth").signToken;

exports.createUser = async (req, res) => {
  const user = await Model.create({ ...req.body });
  res.send(user);
};

exports.getAll = async (req, res) => {
  const users = await Model.find({}).select("-password").exec();
  res.send(users);
};

exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const data = req.body;
  const update = await Model.findOneAndUpdate(
    { _id: userId },
    { $set: data },
    { new: true }
  );
  res.send(update);
};

exports.deleteUser = async (req, res) => {
  const result = await Model.findByIdAndDelete({ _id: req.params.id });
  res.send(result);
};

exports.getSettings = async (req, res) => {
  const { user, source = "atom" } = req;
  const settings = _.get(user, `settings.${source}`, {});
  res.send({ settings });
};

exports.updateSettings = async (req, res) => {
  const { user, source = "atom" } = req;
  const [setting] = Object.entries(req.body);
  const [settingKey, value] = setting;
  const key = `settings.${source}.${settingKey}`;
  const result = await Model.findByIdAndUpdate(
    { _id: user._id },
    {
      $set: {
        [key]: value,
      },
    }
  );
  res.send(result);
};
