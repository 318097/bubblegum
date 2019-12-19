const Model = require("./model");
const UserModel = require("../user/model");

const { ObjectId } = require("mongoose").Types;

exports.getContactList = async (req, res, next) => {
  const { contactList = [] } = req.user;
  const results = await UserModel.aggregate([
    { $match: { _id: { $in: contactList } } },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1
      }
    }
  ]);
  res.send({ contacts: results });
};

exports.getUserChat = async (req, res, next) => {
  const sender = req.user._id;
  const { receiverId: receiver } = req.params;

  const chat = await Model.aggregate([
    { $match: { sender, receiver: ObjectId(receiver) } },
    { $sort: { createdAt: 1 } },
    { $limit: 50 }
  ]);
  res.send({ chat });
};

exports.createMessage = async message => await Model.create(message);
