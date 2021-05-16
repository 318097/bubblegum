const { ObjectId } = require("mongoose").Types;
const UserModel = require("../user/user.model");
const Model = require("./chat.model");

exports.getContactList = async (req, res) => {
  const { contactList = [] } = req.user;
  const results = await UserModel.aggregate([
    { $match: { _id: { $in: contactList } } },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
      },
    },
  ]);
  res.send({ contacts: results });
};

exports.getUserChat = async (req, res) => {
  const sender = req.user._id;
  const { receiverId: receiver } = req.params;

  const chat = await Model.aggregate([
    {
      $match: {
        sender: { $in: [sender, ObjectId(receiver)] },
        receiver: { $in: [sender, ObjectId(receiver)] },
      },
    },
    { $sort: { createdAt: 1 } },
    { $limit: 50 },
  ]);
  res.send({ chat });
};

exports.createMessage = async (message) => await Model.create(message);

exports.updateMessage = async (tempId, _id, messageUpdate) => {
  const aggregation = [];
  if (tempId) aggregation.push({ tempId });
  if (_id) aggregation.push({ _id: Object(_id) });

  return await Model.findOneAndUpdate(
    { $or: aggregation },
    { $set: messageUpdate },
    { new: true }
  );
};
