const Model = require("./model");

const { ObjectId } = require("mongoose").Types;

exports.getAllNotes = async (req, res, next) => {
  const result = await Model.aggregate([{ $match: { userId: req.user._id } }]);
  res.send({ notes: result });
};

exports.getNoteById = async (req, res, next) => {
  const result = await Model.find({ _id: req.params.id });
  res.send({ note: result });
};

exports.createNote = async (req, res, next) => {
  const { title, content, type } = req.body;

  const result = await Model.create({
    title,
    content,
    type,
    userId: req.user._id
  });
  res.send({ result });
};

exports.updateNote = async (req, res, next) => {
  const { title, content, type } = req.body;
  const noteId = req.params.id;
  const result = await Model.findOneAndUpdate(
    {
      _id: noteId
    },
    {
      $set: {
        title,
        content,
        type
      }
    }
  );
  res.send({ result });
};

exports.deleteNote = async (req, res, next) => {
  const noteId = req.params.id;
  const result = await Model.findOneAndDelete({
    _id: noteId
  });
  res.send({ result });
};
