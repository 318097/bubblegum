const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { APP_LIST } = require("../../constants");

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
  },
  {
    timestamps: true,
    strict: false,
  }
);

UserSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = this.encryptPassword(this.password);
  next();
});

UserSchema.methods = {
  authenticate: function (plainTextPassword) {
    return bcrypt.compareSync(plainTextPassword, this.password);
  },
  encryptPassword: function (plainTextPassword) {
    if (!plainTextPassword) return "";

    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(plainTextPassword, salt);
  },
};

module.exports = mongoose.model("user", UserSchema);
