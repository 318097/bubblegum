const mongoose = require('mongoose');
const moment = require('moment');

const Model = require('./model');
const UserModel = require('../user/model');

const { ObjectId } = mongoose.Types;

const updateCount = async ({ userId, expenseTypeId, value }) => await UserModel.findOneAndUpdate(
  {
    _id: userId,
    'expenseTypes._id': ObjectId(expenseTypeId)
  }, {
    $inc: {
      'expenseTypes.$.count': value
    }
  }
);

exports.getAllExpenseTypes = async (req, res, next) => res.send({ expenseTypes: req.user.expenseTypes })

exports.getAllExpenses = async (req, res, next) => {
  const result = await Model.find({ userId: req.user._id }, null, { sort: { createdAt: -1 } });
  res.send({ expenses: result });
};

exports.getMonthlyExpense = async (req, res, next) => {
  const { month } = req.params;
  const { year = moment().year() } = req.query;

  const monthStart = moment(`${month}-${year}`, 'MM-YYYY').startOf('month');
  const monthEnd = moment(`${month}-${year}`, 'MM-YYYY').endOf('month');

  const result = await Model.find(
    {
      userId: req.user._id,
      createdAt: {
        $gte: monthStart,
        $lte: monthEnd
      }
    },
    null,
    {
      sort: { createdAt: -1 }
    }
  );
  res.send({ expenses: result });
};

exports.createExpenseType = async (req, res, next) => {
  const { name } = req.body;
  const result = await UserModel.findOneAndUpdate(
    {
      _id: req.user._id
    }, {
      $push: {
        expenseTypes: {
          name,
          _id: new ObjectId(),
          count: 0
        }
      }
    }
  );
  res.send({ result });
};

exports.createExpense = async (req, res, next) => {
  const { expenseTypeId, amount, message } = req.body;
  const result = await Model.create({
    expenseTypeId, amount, message, userId: req.user._id
  });
  updateCount({ userId: req.user._id, expenseTypeId, value: 1 });
  res.send({ result });
};

exports.updateExpenseType = async (req, res, next) => {
  const { name } = req.body;
  const expenseTypeId = req.params.id;
  const result = await UserModel.findOneAndUpdate(
    {
      _id: req.user._id,
      'expenseTypes._id': expenseTypeId
    }, {
      $set: {
        'expenseTypes.$.name': name
      }
    }
  );
  res.send({ result });
};

exports.updateExpense = async (req, res, next) => {
  const { expenseTypeId, amount, message } = req.body;
  const expenseId = req.params.id;
  const result = await Model.findOneAndUpdate(
    {
      _id: expenseId
    }, {
      $set: {
        expenseTypeId, amount, message, userId: req.user._id
      }
    }
  );
  res.send({ result });
};

exports.deleteExpenseType = async (req, res, next) => {
  const expenseTypeId = req.params.id;
  const result = await UserModel.findOneAndUpdate(
    {
      _id: req.user._id
    }, {
      $pull: {
        expenseTypes: {
          _id: ObjectId(expenseTypeId)
        }
      }
    }
  );
  res.send({ result });
};

exports.deleteExpense = async (req, res, next) => {
  const expenseId = req.params.id;
  const result = await Model.findOneAndDelete(
    { _id: ObjectId(expenseId) }
  );
  updateCount({ userId: req.user._id, expenseTypeId: result.expenseTypeId, value: -1 });
  res.send({ result });
};
