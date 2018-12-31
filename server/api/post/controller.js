const con = require('../../config/mysql');

exports.getAll = (req, res, next) => {
  con.getConnection(er => {
    con.query(`SELECT * FROM posts`, (err, result) => {
      res.send(result);
    });
  });
};

exports.findById = (req, res, next) => {
  con.getConnection(er => {
    con.query(
      `SELECT * FROM posts WHERE id = ${req.params.id}`,
      (err, result) => {
        res.send({ message: 'success', data: result });
      }
    );
  });
};

// exports.create = (req, res, next) => {
//   con.getConnection(er => {
//     con.query(`
//     INSERT into posts()
//     VALUES()
//     `, (err, result) => {
//       res.send(result);
//     });
//   });
// };

// exports.update = (req, res, next) => {
//   con.getConnection(er => {
//     con.query(`SELECT * FROM posts`, (err, result) => {
//       res.send(result);
//     });
//   });
// };

exports.delete = (req, res, next) => {
  con.getConnection(er => {
    con.query(
      `DELETE FROM posts WHERE id = ${req.params.id}`,
      (err, result) => {
        res.send(result);
      }
    );
  });
};
