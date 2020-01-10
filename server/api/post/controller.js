const Model = require("./model");

// const admin = require('firebase-admin');
// const serviceAccount = require('../../../notes-5211e-3465767e96c6.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });
// const firestore = admin.firestore();
// const notesRef = firestore.collection('notes');

exports.getAllPosts = async (req, res, next) => {
  const {
    search,
    limit = 10,
    page = 1,
    tags = [],
    type,
    status,
    visible
  } = req.query;
  const aggregation = {};

  if (tags.length) aggregation["tags"] = { $in: [].concat(tags) };

  if (search) {
    const regex = new RegExp(search, "gi");
    aggregation["title"] = { $regex: regex };
  }

  if (
    req.headers.hasOwnProperty("external-source") &&
    req.headers["external-source"] === "NOTES_APP"
  ) {
    if (status && status !== "ALL") aggregation["status"] = status;

    if (visible) aggregation["visible"] = visible;
  } else {
    aggregation.status = "POSTED";
    aggregation.visible = true;
  }

  const result = await Model.aggregate([
    { $match: aggregation },
    { $skip: (page - 1) * Number(limit) },
    { $limit: Number(limit) }
  ]);

  const count = await Model.find(aggregation).count();

  // const querySnapshot = await notesRef.get();
  // const result = [];
  // querySnapshot.forEach(doc => result.push({ ...doc.data(), _id: doc.id }));

  res.send({ posts: result, meta: { count } });
};

exports.getPostById = async (req, res, next) => {
  const result = await Model.findOne({ _id: req.params.id });

  // const docRef = await notesRef.doc(req.params.id).get();
  // const result = docRef.data();

  res.send({ post: result });
};

exports.createPost = async (req, res, next) => {
  const { userId, data } = req.body;
  const posts = []
    .concat(data)
    .map(item => ({ ...item, userId: userId || "admin" }));
  const result = await Model.create(posts);
  res.send({ result });
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.id;
  const result = await Model.findOneAndUpdate(
    {
      _id: postId
    },
    {
      $set: {
        ...req.body
      }
    }
  );
  res.send({ result });
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.id;
  const result = await Model.findOneAndDelete({
    _id: postId
  });
  res.send({ result });
};
