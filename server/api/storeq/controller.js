const moment = require("moment");
const Joi = require("@hapi/joi");

const Model = require("./model");
const UserModel = require("../user/model");

const { ObjectId } = require("mongoose").Types;

exports.showAllBookings = async (req, res, next) => {
  const storeId = req.params._id;
  const result = await Model.find({ storeId });
  res.send({ orders: result });
};

exports.createBooking = async (req, res, next) => {
  const { storeId, userId } = req.body;

  const result = await Model.create({
    storeId,
    userId,
  });
  res.send({ result });
};

// exports.updateBooking = async (req, res, next) => {
//   const { task, type } = req.body;
//   const todoId = req.params.id;
//   const result = await Model.findOneAndUpdate(
//     {
//       _id: todoId
//     },
//     {
//       $set: {
//         task,
//         type,
//         userId: req.user._id
//       }
//     }
//   );
//   res.send({ result });
// };

exports.stampBooking = async (req, res, next) => {
  const { status } = req.body;
  const bookingId = req.params.id;

  const result = await Model.findOneAndUpdate(
    {
      _id: ObjectId(bookingId),
    },
    {
      status,
    }
  );
  res.send({ result });
};

// exports.cancelBooking = async (req, res, next) => {
//   const todoId = req.params.id;
//   const result = await Model.findOneAndDelete({
//     _id: todoId
//   });
//   res.send({ result });
// };
