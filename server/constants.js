const ACCOUNT_STATUS = [
  "INIT", // just created. Not verified yet
  "ACTIVE", // verified and in working condition
  "SUSPENDED", // temporarily blocked/suspended for some reason
  "DELETED", // soft delete
];

const USER_TYPES = ["ADMIN", "USER"];
const VERIFICATION_METHODS = ["LOGIN", "GOOGLE"];
const TAG_MODULE_NAMES = [
  "EXPENSE_TYPES",
  "EXPENSE_CATEGORIES",
  "EXPENSE_SOURCES",
  "EXPENSE_GROUPS",
  "COLLECTION",
];

const MODULE_TYPES = ["TIMELINE", "COLLECTION"];

// Names the v2 mongoose models are registered under. Model files, `ref`s and
// `$lookup`s must use these instead of string literals, so renaming a model
// here keeps `populate` working everywhere. (mongoose derives the collection
// name from the model name.)
const V2_MODELS = {
  USER: "user_v2",
  ALBUM: "album",
  FILES: "files",
  LYNK_COLLECTION: "lynk",
  LYNKS: "links",
  ALERTS: "alert-and-msges",
  ACTIVITIES: "activities",
  CIRCLE: "circle",
  BUSINESS_POST: "business-post",
  BUSINESS_SERVICE: "business-service",
  BUSINESS_OFFER: "business-offer",
  BUSINESS_FAQ: "business-faq",
  EDITABLES: "editables",
  HABITS: "habits",
};

export default {
  TAG_MODULE_NAMES,
  ACCOUNT_STATUS,
  USER_TYPES,
  VERIFICATION_METHODS,
  MODULE_TYPES,
  V2_MODELS,
};
