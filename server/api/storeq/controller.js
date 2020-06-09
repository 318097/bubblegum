const moment = require("moment");
const Joi = require("@hapi/joi");
const admin = require("firebase-admin");
const _ = require("lodash");

const { ObjectId } = require("mongoose").Types;

const logger = require("../../util/logger");
const Model = require("./model");
const UserModel = require("../user/model");

const serviceAccount = require("../../../storeq-d518c-firebase-adminsdk-cv2ze-0b870f5cf0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://storeq-d518c.firebaseio.com",
});

const sendNotificaiton = async (userList = []) => {
  try {
    console.log("notify::", userList);
    const fcm = []
      .concat(userList)
      .filter((userList) => !!userList.clientToken)
      .map((user) => {
        const { message, clientToken } = user;
        const messageObj = {
          notification: {
            title: "StoreQ",
            body: message,
          },
          token: clientToken,
        };

        return admin.messaging().send(messageObj);
      });

    return await Promise.all(fcm);
  } catch (error) {
    console.log("Error sending message:", error);
  }
};

const cache = {};

const logCache = () =>
  logger.test("[CACHE]: ", JSON.stringify(cache, undefined, 2));

const initializeCache = async () => {
  const waitingList = await Model.aggregate([
    { $match: { status: "WAITING" } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 1,
        status: 1,
        storeId: 1,
        waitingNo: 1,
        userId: 1,
        clientToken: "$user.clientToken",
      },
    },
  ]);
  waitingList.forEach((booking) => {
    const storeId = String(booking.storeId);
    cache[storeId] = cache[storeId] ? [...cache[storeId], booking] : [booking];
  });
  logCache();
};

setTimeout(initializeCache, 1000);

const addToCache = ({ booking, storeId }) =>
  (cache[storeId] = cache[storeId] ? [...cache[storeId], booking] : [booking]);

const removeFromQueue = ({ bookingId, storeId }) => {
  if (cache[storeId]) {
    const removed = cache[storeId].shift();
    sendNotificaiton({
      clientToken: removed.clientToken,
      message: "Completed",
    });
    return removed._id === bookingId;
  }
};

const getWaitingNo = (storeId) =>
  cache[storeId] ? cache[storeId].length + 1 : 1;

exports.getAllStores = async (req, res, next) => {
  const result = await UserModel.find({ type: "SELLER" });
  res.send({ stores: result });
};

exports.showAllBookingsForStore = async (req, res, next) => {
  const storeId = req.params.id;
  const result = await Model.aggregate([
    { $match: { storeId: ObjectId(storeId) } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
    },
  ]);
  res.send({ bookings: result });
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
  const booking = {
    ...result.toObject(),
    clientToken: _.get(req, "user.clientToken", ""),
  };
  addToCache({ booking, storeId });
  logCache();
  res.send({ booking });
};

exports.updateBooking = async (req, res) => {
  const { status, storeId } = req.body;
  const bookingId = req.params.id;
  const updatedData = {
    status,
  };

  if (status === "COMPLETE") updatedData["waitingNo"] = 0;

  const result = await Model.findOneAndUpdate(
    {
      _id: ObjectId(bookingId),
    },
    updatedData,
    {
      new: true,
    }
  );
  removeFromQueue({ bookingId, storeId });

  const userIdsToUpdate = cache[storeId].map((booking) =>
    String(booking.userId)
  );
  await Model.updateMany(
    { _id: { $in: [userIdsToUpdate] } },
    {
      $inc: {
        waitingNo: -1,
      },
    }
  );

  const userList = cache[storeId].map((booking) => {
    return {
      clientToken: booking.clientToken,
      message: `You waiting list is ${Number(booking.waitingNo) - 1}`,
    };
  });

  await sendNotificaiton(userList);
  logCache();
  res.send({ result });
};

// exports.cancelBooking = async (req, res, next) => {
//   const todoId = req.params.id;
//   const result = await Model.findOneAndDelete({
//     _id: todoId
//   });
//   res.send({ result });
// };
