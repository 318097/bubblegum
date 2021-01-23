const _ = require("lodash");
const Model = require("./model");
const { ObjectId } = require("mongoose").Types;

exports.createUser = async (req, res) => {
  const user = await Model.create({ ...req.body, source: req.source });
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
  const { user, source = "DEFAULT" } = req;
  const settings = _.get(user, `settings.${source}`, {});
  res.send({ settings });
};

exports.updateSettings = async (req, res) => {
  const { user, source = "DEFAULT" } = req;
  const key = `settings.${source}`;
  const result = await Model.findByIdAndUpdate(
    { _id: user._id },
    {
      $set: {
        [key]: req.body,
      },
    },
    {
      new: true,
    }
  );
  res.send(result);
};

exports.updateAppData = async (req, res) => {
  const { user, query, body } = req;
  const { action } = query;
  let data;
  switch (action) {
    case "CREATE_TIMELINE_GROUP":
      const projectId = new ObjectId();
      const timeline = {
        ...body,
        _id: projectId,
        createdAt: new Date().toISOString(),
      };
      data = {
        $push: { timeline },
      };
      break;
  }

  const result = await Model.findByIdAndUpdate({ _id: user._id }, data, {
    new: true,
  }).lean();

  res.send({ result });
};
