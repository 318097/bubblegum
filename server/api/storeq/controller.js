const moment = require("moment");
const Joi = require("@hapi/joi");
const { ObjectId } = require("mongoose").Types;

const Model = require("./model");
const UserModel = require("../user/model");

const cache = {};

const initializeCache = async () => {
  const waitingList = await Model.find({ status: "WAITING" });
  waitingList.forEach((booking) => {
    const storeBookings = cache[booking.storeId] || [];
    storeBookings.push(booking._id);
    cache[booking.storeId] = storeBookings;
  });
};

setTimeout(initializeCache, 1000);

const addToCache = ({ bookingId, storeId }) =>
  (cache[storeId] = cache[storeId]
    ? [...cache[storeId], bookingId]
    : [bookingId]);

const getWaitingNo = (storeId) => (cache[storeId] ? cache[storeId].length : 1);

exports.getAllStores = async (req, res, next) => {
  const result = await UserModel.find({ type: "SELLER" });
  res.send({ stores: result });
};

exports.showAllBookingsForStore = async (req, res, next) => {
  const storeId = req.params._id;
  const result = await Model.find({ storeId });
  res.send({ orders: result });
};

exports.showAllBookingsForBuyer = async (req, res, next) => {
  const userId = req.params.id;
  const result = await Model.find({ userId: ObjectId(userId) });
  res.send({ orders: result });
};

exports.createBooking = async (req, res, next) => {
  const { storeId, userId } = req.body;
  const waitingNo = getWaitingNo(storeId);

  const result = await Model.create({
    storeId,
    userId,
    status: "WAITING",
    waitingNo,
  });
  addToCache({ userId, storeId });

  res.send({ waitingNo, status: "WAITING", bookingId: result._id, storeId });
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
