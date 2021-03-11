const _ = require("lodash");
const { generateSlug, headers } = require("./common/helpers");
const { getUserV2 } = require("./common/middlewares");
const connectToDb = require("../db");
const User = require("../server/api/user/model");
const Model = require("../server/api/post/model");

exports.handler = async (event) => {
  try {
    await connectToDb();

    const user = await getUserV2(event);

    const { _id, userType } = user;
    const { data = [] } = JSON.parse(event.body);
    const { collectionId } = event.queryStringParameters;

    const currentCollection = _.get(user, ["notesApp", collectionId], {});
    let index = _.get(currentCollection, "index", 1);

    const posts = [].concat(data).map((item) => {
      const slug = item.slug ? item.slug : generateSlug({ title: item.title });
      const postIndex = index;
      index++;

      return {
        ...item,
        status: "QUICK_ADD",
        userId: _id,
        isAdmin: userType === "ADMIN",
        index: postIndex,
        collectionId,
        slug,
        source: event["multiValueHeaders"]["external-source"],
      };
    });

    const result = await Model.create(posts);

    await User.findOneAndUpdate(
      { _id },
      { $set: { [`notesApp.${collectionId}.index`]: index } }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result),
      headers,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 200,
      body: err.message,
      headers,
    };
  }
};
