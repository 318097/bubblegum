const mongoose = require("mongoose");
const { PRODUCT_LIST } = require("../../utils/products");
const constants = require("../../constants");
const { encryptPassword, comparePassword } = require("./user.utils");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    bookmarkedPosts: {
      type: Array,
    },
    source: {
      type: String,
      enum: PRODUCT_LIST,
      required: true,
    },
    userType: { type: String, enum: constants.USER_TYPES, default: "USER" },
    lastPasswordUpdated: Date,
    accountStatus: {
      verified: { type: Boolean, default: false },
      verifiedOn: Date,
      verificationToken: String,
      verificationSource: String,
      verificationMethod: {
        type: String,
        enum: constants.VERIFICATION_METHODS,
        default: "LOGIN",
      },
      status: { type: String, enum: constants.ACCOUNT_STATUS, default: "INIT" },
    },
    resetToken: String,
    lastLogin: Date,
    appStatus: Object,
    settings: Object,
  },
  {
    timestamps: true,
    strict: true,
  }
);

UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = this.encryptPassword(this.password);
  next();
});

UserSchema.methods = {
  authenticate: function (plainPassword) {
    return comparePassword(plainPassword, this.password);
  },
  encryptPassword,
};

module.exports = mongoose.model("user", UserSchema);
