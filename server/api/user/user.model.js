const mongoose = require("mongoose");
const { APP_LIST } = require("../../constants");
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
    mobile: {
      type: String,
    },
    contactList: {
      type: Array,
    },
    expenseTypes: {
      type: Array,
    },
    notesApp: {},
    source: {
      type: String,
      enum: APP_LIST,
      required: true,
    },
    bookmarkedPosts: {
      type: Array,
    },
    timeline: {
      type: Array,
    },
    userType: String,
    lastPasswordUpdated: Date,
    accountStatus: {
      verified: Boolean,
      verifiedOn: Date,
      verificationToken: String,
      verificationSource: String,
      verificationMethod: String,
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
