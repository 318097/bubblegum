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
  { key: "EXPENSE", label: "Expense", success: "DOWN" },
  { key: "BILLS", label: "Bills", success: "DOWN" },
  // { key: "LOAN", label: "Lend" },
  { key: "INVESTMENT", label: "Investment", success: "UP" },
  { key: "INCOME", label: "Income", success: "DOWN" },
];

module.exports = {
  APP_LIST,
  APP_INFO,
  defaultExpenseTypes,
};
