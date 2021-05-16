const moment = require("moment");
const _ = require("lodash");

const { ObjectId } = require("mongoose").Types;

const UserModel = require("../user/user.model");
const Model = require("./storeq.model");
const {
  sendNotificaiton,
  getCurrentDate,
  getWaitingInfo,
  addToCache,
  updateInCache,
  // getFromCache,
  cache,
  logCache,
  removeFromCache,
} = require("./storeq.utils");

exports.getAllStores = async (req, res) => {
  const result = await UserModel.find({ type: "SELLER" });
  res.send({ stores: result });
};

exports.showAllBookingsForStore = async (req, res) => {
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

exports.showAllBookingsForBuyer = async (req, res) => {
  const userId = req.params.id;
  const result = await Model.find({ userId: ObjectId(userId) });
  res.send({ orders: result });
};

exports.createBooking = async (req, res) => {
  const { storeId, userId } = req.body;
  const { waitingNo, avgTime, status, startedOn } = getWaitingInfo(storeId);

  const result = await Model.create({
    storeId,
    userId,
    status,
    startedOn,
    waitingNo,
    initialWaitingNo: waitingNo,
  });
  const booking = {
    ...result.toObject(),
    avgTime,
    clientToken: _.get(req, "user.clientToken", ""),
  };
  addToCache({ booking, storeId });
  logCache();
  res.send({ booking });
};

exports.updateBooking = async (req, res) => {
  try {
    const { status, storeId } = req.body;
    const bookingId = req.params.id;
    const updatedData = {
      status,
    };

    const booking = removeFromCache({ storeId });
    if (status === "COMPLETE") {
      updatedData["waitingNo"] = null;
      updatedData["ttf"] = moment().diff(moment(booking.startedOn), "minutes");
      updatedData["completedOn"] = getCurrentDate();
    }

    const result = await Model.findOneAndUpdate(
      {
        _id: ObjectId(bookingId),
      },
      updatedData,
      {
        new: true,
      }
    );

    const updatedBooking = { ...booking, ...result.toObject() };
    const [nextActiveBooking, ...restOfBookings] = updateInCache({
      storeId,
      booking: updatedBooking,
    });

    if (nextActiveBooking) {
      await Model.updateMany(
        { _id: nextActiveBooking },
        {
          $set: {
            waitingNo: 1,
            status: "ACTIVE",
            startedOn: getCurrentDate(),
          },
        }
      );
    }

    await Model.updateMany(
      { _id: { $in: [restOfBookings] } },
      {
        $inc: {
          waitingNo: -1,
        },
      }
    );

    const userList = _.get(cache, [storeId, "bookings"], []).map((booking) => ({
      clientToken: booking.clientToken,
      message: `You waiting list is ${booking.waitingNo}`,
    }));

    await sendNotificaiton(userList);
    logCache();
    res.send({ result });
  } catch (err) {
    console.log(err);
  }
};
