const jwt = require("jsonwebtoken");
const { connectToDb } = require("./db");
const config = require("../../config");
const ObjectID = require("mongodb").ObjectID;
const User = require("../../server/api/user/model");

const getUser = async (event) => {
  const token = event["multiValueHeaders"]["authorization"];

  if (!token) return new Error("No JWT");

  const db = await connectToDb();
  const decoded = jwt.verify(token[0], config.JWT);

  const user = await db
    .collection("users")
    .findOne({ _id: ObjectID(decoded._id) });

  return user;
};

const getUserV2 = async (event) => {
  const token =
    event["multiValueHeaders"]["Authorization"] ||
    event["multiValueHeaders"]["authorization"];

  if (!token) throw new Error("No JWT");

  const decoded = jwt.verify(token[0], config.JWT);

  const user = await User.findOne({ _id: decoded._id });

  if (!user) throw new Error("Invalid user");

  return user;
};

module.exports = { getUser, getUserV2 };
