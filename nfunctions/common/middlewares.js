const jwt = require("jsonwebtoken");
const { connectToDb } = require("./db");
const config = require("../../config");
const ObjectID = require("mongodb").ObjectID;

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

module.exports = { getUser };
