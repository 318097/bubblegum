const User = require("../server/api/user/model");
const connectToDb = require("../db");
const { headers } = require("./common/helpers");
const { signToken } = require("../server/auth/auth");

exports.handler = async (event) => {
  try {
    await connectToDb();

    const { username, password } = JSON.parse(event.body);

    if (!username || !password)
      return {
        statusCode: 401,
        body: "Username & Password is required.",
        headers,
      };

    let user = await User.findOne({ username });

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
      statusCode: 400,
      body: err.message,
      headers,
    };
  }
};
