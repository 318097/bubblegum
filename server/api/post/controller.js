const Model = require("./model");

// const admin = require('firebase-admin');
// const serviceAccount = require('../../../notes-5211e-3465767e96c6.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });
// const firestore = admin.firestore();
// const notesRef = firestore.collection('notes');

exports.getAllPosts = async (req, res, next) => {
  const result = await Model.find({});

  // const querySnapshot = await notesRef.get();
  // const result = [];
  // querySnapshot.forEach(doc => result.push({ ...doc.data(), _id: doc.id }));

  res.send({ posts: result });
};

exports.getPostById = async (req, res, next) => {
  const result = await Model.findOne({ _id: req.params.id });

  // const docRef = await notesRef.doc(req.params.id).get();
  // const result = docRef.data();

  res.send({ post: result });
};

exports.createPost = async (req, res, next) => {
  const { userId, ...post } = req.body;
  const result = await Model.create({
    ...post,
    userId: userId || 'admin'
  });
  res.send({ result });
};

exports.updatePost = async (req, res, next) => {
  const { title, content, type } = req.body;
  const postId = req.params.id;
  const result = await Model.findOneAndUpdate(
    {
      _id: postId
    },
    {
      $set: {
        title,
        content,
        type
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
