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

exports.getAllExpenseTypes = async (req, res, next) => {
  try {
    res.send({ expenseTypes: req.user.expenseTypes })
  } catch (err) {
    next(err);
  }
};

exports.getAllExpenses = async (req, res, next) => {
  try {
    const result = await Model.find({ userId: req.user._id });
    res.send({ expenses: result });
  } catch (err) {
    next(err);
  }
};

exports.getMonthlyExpense = async (req, res, next) => {
  try {
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
    res.send({ monthly_expenses: result });
  } catch (err) {
    next(err);
  }
};

exports.createExpenseType = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

exports.createExpense = async (req, res, next) => {
  try {
    const { expenseTypeId, expense, message } = req.body;
    const result = await Model.create({
      expenseTypeId, expense, message, userId: req.user._id
    });
    updateCount({ userId: req.user._id, expenseTypeId, value: 1 });
    res.send({ result });
  } catch (err) {
    next(err);
  }
};

exports.updateExpenseType = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const { expenseTypeId, expense, message } = req.body;
    const expenseId = req.params.id;
    const result = await Model.findOneAndUpdate(
      {
      _id: expenseId
    }, {
        $set: {
          expenseTypeId, expense, message, userId: req.user._id
        }
      }
    );
    res.send({ result });
  } catch (err) {
    next(err);
  }
};

exports.deleteExpenseType = async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expenseId = req.params.id;
    const result = await Model.findOneAndDelete(
      {
        _id: expenseId
      }
    );
    updateCount({ userId: req.user._id, expenseTypeId: result.expenseTypeId, value: -1 });
    res.send({ result });
  } catch (err) {
    next(err);
  }
};
