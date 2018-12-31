const mysql = require('mysql');

// const con = mysql.createConnection({
const con = mysql.createPool({
  host: '148.66.136.1',
  database: 'at0m',
  user: 'brainbox_admin',
  password: '#Brainbox123'
});

// con.connect(function (err) {
//     if (err) throw err;
//     console.log("Connected to MySQL server.");
// });

module.exports = con;
