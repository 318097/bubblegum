const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  mobile: {
    type: String,
    required: false
  },
  about: Schema.Types.Mixed
});

UserSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  this.password = this.encryptPassword(this.password);
  next();
});

UserSchema.methods = {
  // check the password on signin
  authenticate: function(plainTextPassword) {
    return bcrypt.compareSync(plainTextPassword, this.password);
  },
  // hash the passwords
  encryptPassword: function(plainTextPassword) {
    if (!plainTextPassword) {
      return '';
    } else {
      let salt = bcrypt.genSaltSync(10);
      return bcrypt.hashSync(plainTextPassword, salt);
    }
  },
  toJson: function() {
    var obj = this.toObject();
    delete obj.password;
    return obj;
  }
};

module.exports = mongoose.model('user', UserSchema);
