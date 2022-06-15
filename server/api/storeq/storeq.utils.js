// const Joi = require("@hapi/joi");
const admin = require("firebase-admin");
const moment = require("moment");
const _ = require("lodash");

const logger = require("../../utils/logger");
const serviceAccount = require("../../../storeq-d518c-firebase-adminsdk-cv2ze-0b870f5cf0.json");
const Model = require("./storeq.model");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://storeq-d518c.firebaseio.com",
});

const cache = {};
setTimeout(initializeCache, 1000);

const logCache = () =>
  logger.test("[CACHE]: ", JSON.stringify(cache, undefined, 2));

const initializeStore = (storeId) => {
  if (!cache[storeId])
    cache[storeId] = {
      bookings: [],
      avgTime: 0,
      waitingNo: 1,
    };
};

async function initializeCache() {
  const waitingList = await Model.aggregate([
    { $match: { status: { $in: ["ACTIVE", "WAITING"] } } },
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
        ttf: 1,
        startedOn: 1,
      },
    },
  ]);
  _.forEach(waitingList, (booking) => {
    const storeId = String(booking.storeId);
    initializeStore(storeId);
    cache[storeId]["bookings"] = [...cache[storeId]["bookings"], booking];
    cache[storeId]["waitingNo"]++;
  });

  // logCache();
}

const addToCache = ({ booking, storeId }) => {
  cache[storeId]["bookings"].push(booking);
  cache[storeId]["waitingNo"] =
    _.get(cache, [storeId, "bookings", "length"]) + 1;
};

const updateInCache = ({ storeId, booking }) => {
  sendNotificaiton({
    clientToken: booking.clientToken,
    message:
      booking.status === "COMPLETE" ? "Completed Queue" : "Queue Cancelled.",
    title: booking.storeName,
    // action: status === "COMPLETE" && "SUCCESS",
  });

  const storeInfo = cache[storeId] || {};

  const updatedBookings = _.map(_.get(storeInfo, "bookings", []), (item) => ({
    ...item,
    waitingNo: item.waitingNo - 1,
    status: item.waitingNo - 1 === 1 ? "ACTIVE" : "WAITING",
    startedOn: item.waitingNo - 1 === 1 && getCurrentDate(),
  }));

  const avgTime = calculateAvgWaitingTime([
    { ttf: _.get(storeInfo, "avgTime", 0) },
    booking,
  ]);
  const waitingNo = updatedBookings.length;
  cache[storeId] = {
    ...storeInfo,
    bookings: updatedBookings,
    avgTime,
    waitingNo,
  };
  return _.map(updatedBookings, "_id");
};

const getFromCache = ({ storeId, bookingId }) => {
  if (cache[storeId])
    return _.find(
      _.get(cache, [storeId, "bookings"]),
      (booking) => String(booking._id) === bookingId
    );
};

const removeFromCache = ({ storeId }) => cache[storeId]["bookings"].shift();

const calculateAvgWaitingTime = (bookings) =>
  bookings.reduce((avg, booking) => avg + Number(booking.ttf), 0) /
  bookings.length;

const getWaitingInfo = (storeId) => {
  initializeStore(storeId);
  const { waitingNo, avgTime } = cache[storeId];
  const status = waitingNo === 1 ? "ACTIVE" : "WAITING";
  const startedOn = status === "ACTIVE" ? getCurrentDate() : null;
  return { waitingNo, avgTime, status, startedOn };
};

const getCurrentDate = () => moment().format();

const sendNotificaiton = async (notifyList = []) => {
  try {
    // console.log("notify::", notifyList);
    const fcm = []
      .concat(notifyList)
      .filter((notifyList) => !!notifyList.clientToken)
      .map((item) => {
        const { message, clientToken, action } = item;
        const messageObj = {
          notification: {
            title: "StoreQ",
            body: message,
            // action,
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

module.exports = {
  sendNotificaiton,
  getCurrentDate,
  getWaitingInfo,
  calculateAvgWaitingTime,
  addToCache,
  updateInCache,
  getFromCache,
  cache,
  logCache,
  removeFromCache,
};
