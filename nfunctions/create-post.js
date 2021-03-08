const _ = require("lodash");
const { connectToDb, ObjectID } = require("./common/db");
const { generateSlug, headers } = require("./common/helpers");
const { getUser } = require("./common/middlewares");

exports.handler = async (event, context) => {
  try {
    const db = await connectToDb();

    const user = getUser(event);

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
        type: "QUICK_ADD",
        userId: _id,
        isAdmin: userType === "ADMIN",
        index: postIndex,
        collectionId,
        slug,
      };
    });

    await db.collection("posts").insertMany(posts);

    await db
      .collection("users")
      .updateOne(
        { _id: ObjectID(_id) },
        { $set: { [`notesApp.${collectionId}.index`]: index } }
      );

    return {
      statusCode: 200,
      body: "ok",
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
