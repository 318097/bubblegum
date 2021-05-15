const { generateObjectId } = require("./helpers");

const generateDefaultState = (req) => {
  const defaultState = {
    source: req.source,
    timeline: {
      name: "Default",
      default: true,
      _id: generateObjectId(),
      createdAt: new Date().toISOString(),
    },
    expenseTypes: [
      { _id: generateObjectId(), key: "EXPENSE", label: "Expense" },
      { _id: generateObjectId(), key: "BILLS", label: "Bills" },
      { _id: generateObjectId(), key: "LOAN", label: "Lend" },
      { _id: generateObjectId(), key: "INVESTMENT", label: "Investment" },
      { _id: generateObjectId(), key: "INCOME", label: "Income" },
    ],
  };

  return defaultState;
};

module.exports = { generateDefaultState };
