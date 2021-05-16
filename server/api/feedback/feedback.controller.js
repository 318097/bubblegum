const Model = require("./feedback.model");

exports.createFeedback = async (req, res) => {
  const { source } = req;
  const { name, _id: userId, email } = req.user || {};
  const userData = userId ? { name, email, userId } : {};

  const result = await Model.create({
    ...req.body,
    ...userData,
    source,
  });
  res.send({ result });
};
