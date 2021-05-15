const Model = require("./scratch-pad.model");
const { fileUpload } = require("../../utils/file-upload");
const { ObjectId } = require("mongoose").Types;
const { generateDate } = require("../../helpers");

exports.getAllItems = async (req, res, next) => {
  const result = await Model.aggregate([
    {
      $match: {
        userId: req.user._id,
        expired: false,
        $and: [{ expires: true }, { expiresOn: { $gt: generateDate() } }],
      },
    },
  ]);
  res.send({ items: result });
};

exports.getItemById = async (req, res, next) => {
  const result = await Model.find({ _id: req.params.id });
  res.send({ item: result });
};

exports.createItem = async (req, res, next) => {
  const fileResult = await fileUpload(req);

  const result = await Model.create({
    ...req.body,
    userId: req.user._id,
    media: fileResult || [],
  });
  res.send({ result });
};

exports.updateItem = async (req, res, next) => {
  const itemId = req.params.id;
  const result = await Model.findOneAndUpdate(
    {
      _id: itemId,
    },
    {
      $set: {
        ...req.body,
      },
    }
  );
  res.send({ result });
};

exports.deleteItem = async (req, res, next) => {
  const itemId = req.params.id;
  const result = await Model.findOneAndDelete({
    _id: itemId,
  });
  res.send({ result });
};
