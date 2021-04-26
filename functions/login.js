const User = require("../server/api/user/model");
const connectToDb = require("../db");
const { headers } = require("./common/helpers");
const jwt = require("jsonwebtoken");
const config = require("../config");

exports.handler = async (event) => {
  try {
    await connectToDb();

    const { username, password } = JSON.parse(event.body);

    if (!username || !password)
      return {
        statusCode: 400,
        body: "Username & Password is required.",
        headers,
      };

    let user = await User.findOne({ username });

    if (!user)
      return {
        statusCode: 400,
        body: "User not found.",
        headers,
      };

    if (!user.authenticate(password))
      return {
        statusCode: 400,
        body: "Invalid username/password.",
        headers,
      };

    user = user.toObject();
    delete user.password;

    const token = jwt.sign({ _id: user._id, email: user.email }, config.JWT);

    return {
      statusCode: 200,
      body: JSON.stringify({ token, ...user }),
      headers,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 400,
      body: err.message,
      headers,
    };
  }
};
