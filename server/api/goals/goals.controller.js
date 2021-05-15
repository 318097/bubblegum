const moment = require("moment");
const Joi = require("@hapi/joi");

const Model = require("./goals.model");
const UserModel = require("../user/user.model");

const { ObjectId } = require("mongoose").Types;

const GoalSchemaValidator = Joi.object().keys({
  goal: Joi.string().min(3).required(),
  type: Joi.string().regex(/^(DATE|MONTHLY)$/),
});

exports.getAllGoals = async (req, res, next) => {
  const result = await Model.aggregate([{ $match: { userId: req.user._id } }]);
  res.send({ goals: result });
};

exports.getGoalById = async (req, res, next) => {
  const result = await Model.find({ userId: req.user._id, _id: req.params.id });
  res.send({ goal: result });
};

exports.createGoal = async (req, res, next) => {
  // const { error } = Joi.validate(
  //   { goal, type, date },
  //   GoalSchemaValidator
  // );
  // if (error) return res.status(400).send(error.details[0].message);

  const result = await Model.create({
    ...req.body,
    userId: req.user._id,
  });
  res.send({ result });
};

exports.updateGoal = async (req, res, next) => {
  const goalId = req.params.id;
  const result = await Model.findOneAndUpdate(
    {
      _id: goalId,
    },
    {
      $set: {
        ...req.body,
      },
    }
  );
  res.send({ result });
};

exports.stampGoal = async (req, res, next) => {
  const { finishedOn } = req.body;
  const goalId = req.params.id;

  const result = await Model.findOneAndUpdate(
    {
      _id: ObjectId(goalId),
    },
    {
      $set: { finishedOn, status: "DONE" },
    }
  );
  res.send({ result });
};

exports.deleteGoal = async (req, res, next) => {
  const goalId = req.params.id;
  const result = await Model.findOneAndDelete({
    _id: goalId,
  });
  res.send({ result });
};
