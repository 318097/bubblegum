const bcrypt = require("bcrypt");

const encryptPassword = (plainPassword) => {
  if (!plainPassword) return "";

  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plainPassword, salt);
};

const comparePassword = (plainPassword, hashedPassword) =>
  bcrypt.compareSync(plainPassword, hashedPassword);

module.exports = { encryptPassword, comparePassword };
