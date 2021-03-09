const _ = require("lodash");
const User = require("../server/api/user/model");
const { connectToDb, ObjectID, connectToMongoose } = require("./common/db");
const { generateSlug, headers } = require("./common/helpers");
const { getUser } = require("./common/middlewares");
const { signToken } = require("../server/auth/auth");

exports.handler = async (event, context) => {
  try {
    await connectToMongoose();
    const matchQuery = {};
    const { username, password } = JSON.parse(event.body);

    if (!username || !password)
      return res.status(400).send("Username & Password is required.");

    matchQuery["username"] = username;

    let user = await User.findOne(matchQuery);

    if (!user)
      return {
        statusCode: 401,
        body: "User not found.",
        headers,
      };

    if (!user.authenticate(password))
      return {
        statusCode: 401,
        body: "Invalid username/password.",
        headers,
      };

    user = user.toObject();
    delete user.password;

    const token = signToken(user._id, user.email);

    return {
      statusCode: 200,
      body: JSON.stringify({ token, ...user }),
      headers,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 200,
      body: "Error",
      headers,
    };
  }
};
