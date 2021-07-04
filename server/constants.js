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
  { key: "EXPENSE", label: "Expense", success: "DOWN", color: "watermelon" },
  { key: "BILLS", label: "Bills", success: "DOWN", color: "orange" },
  // { key: "LOAN", label: "Lend" },
  { key: "INVESTMENT", label: "Investment", success: "UP", color: "green" },
  { key: "INCOME", label: "Income", success: "DOWN", color: "orchid" },
];

module.exports = {
  APP_LIST,
  APP_INFO,
  defaultExpenseTypes,
};
