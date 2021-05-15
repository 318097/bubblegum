const { generateObjectId, generateDate } = require("./helpers");
const { APP_INFO } = require("./constants");

const generateDefaultState = (req) => {
  const defaultState = {
    source: req.source,
    timeline: {
      name: "Default",
      default: true,
      _id: generateObjectId(),
      createdAt: generateDate(),
    },
    expenseTypes: [
      { _id: generateObjectId(), key: "EXPENSE", label: "Expense" },
      { _id: generateObjectId(), key: "BILLS", label: "Bills" },
      { _id: generateObjectId(), key: "LOAN", label: "Lend" },
      { _id: generateObjectId(), key: "INVESTMENT", label: "Investment" },
      { _id: generateObjectId(), key: "INCOME", label: "Income" },
    ],
    appStatus: Object.entries(APP_INFO)
      .filter(([, { active }]) => active)
      .map(([name]) => ({ [name]: { status: "INIT" } })),
  };

  return defaultState;
};

module.exports = { generateDefaultState };
