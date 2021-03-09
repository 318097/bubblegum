const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// const bcrypt = require("bcrypt");
const { APP_LIST } = require("../../constants");

const UserSchema = new Schema(
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
      required: false,
    },
    mobile: {
      type: String,
    },
    contactList: {
      type: Array,
    },
    about: Schema.Types.Mixed,
    snakeGame: Schema.Types.Mixed,
    expenseTypes: {
      type: Array,
    },
    settings: Schema.Types.Mixed,
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
  // this.password = this.encryptPassword(this.password);
  next();
});

UserSchema.methods = {
  // check the password on signin
  authenticate: function (plainTextPassword) {
    return plainTextPassword === this.password;
    // return bcrypt.compareSync(plainTextPassword, this.password);
  },
  // hash the passwords
  encryptPassword: function (plainTextPassword) {
    if (!plainTextPassword) {
      return "";
    } else {
      // const salt = bcrypt.genSaltSync(10);
      // return bcrypt.hashSync(plainTextPassword, salt);
      return plainTextPassword;
    }
  },
  toJson: function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
  },
};

module.exports = mongoose.model("user", UserSchema);
