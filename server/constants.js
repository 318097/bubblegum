const APP_INFO = {
  NOTES_APP: { active: true, userKeys: ["notesApp"] },
  FIREBOARD: { active: true },
  OCTON: { active: true, userKeys: ["expenseTypes", "timeline"] },
  SNAKE: {},
  CHAT_APP: {},
  STORE_Q: {},
  CODE_DROPS: { active: true, userKeys: ["bookmarkedPosts"] },
  FLASH: { active: true, userKeys: ["notesApp"] },
  E_FEED: {},
};

const APP_LIST = Object.keys(APP_INFO);

const defaultExpenseTypes = [
  { key: "EXPENSE", label: "Expense", success: "DOWN", color: "watermelon" },
  { key: "BILLS", label: "Bills", success: "DOWN", color: "orange" },
  { key: "INVESTMENT", label: "Investment", success: "UP", color: "green" },
  { key: "INCOME", label: "Income", success: "DOWN", color: "orchid" },
];

module.exports = {
  APP_LIST,
  APP_INFO,
  defaultExpenseTypes,
};
