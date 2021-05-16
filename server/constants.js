const APP_INFO = {
  NOTES_APP: { active: true },
  DOT: { active: true },
  ATOM: { active: true },
  SNAKE: {},
  CHAT_APP: {},
  STOREQ: {},
  CODEDROPS: { active: true },
  FLASH: { active: true },
};

const APP_LIST = Object.keys(APP_INFO);

const defaultExpenseTypes = [
  { key: "EXPENSE", label: "Expense" },
  { key: "BILLS", label: "Bills" },
  { key: "LOAN", label: "Lend" },
  { key: "INVESTMENT", label: "Investment" },
  { key: "INCOME", label: "Income" },
];

module.exports = {
  APP_LIST,
  APP_INFO,
  defaultExpenseTypes,
};
