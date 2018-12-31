const con = require('../../config/mysql');

exports.getAll = (req, res, next) => {
  con.getConnection(er => {
    con.query(
      `SELECT * FROM expenses WHERE user_id = ${req.user._id}`,
      (err, result) => {
        res.send({ expenses: result });
      }
    );
  });
};

exports.getMonthlyExpense = (req, res, next) => {
  con.getConnection(er => {
    let month = req.params.month.split('-');
    month =
      month[0] + '-' + (Number(month[1]) <= 9 ? '0' + month[1] : month[1]);
    con.query(
      `
    SELECT expenses.id, expenses.user_id, expenses.amount, expenses.created_at, expense_types.name, expenses.message
    FROM expenses
    INNER JOIN expense_types
    ON expenses.type_id = expense_types.id
    WHERE expenses.user_id = '${req.user._id}' AND 
    expenses.created_at
    LIKE "${month}%" 
    ORDER BY expenses.created_at DESC`,
      (err, result) => {
        res.send({ monthly_expenses: result });
      }
    );
  });
};

exports.getAllExpenseTypes = (req, res, next) => {
  con.getConnection(er => {
    con.query(
      `SELECT * FROM expense_types WHERE user_id = '${
        req.user._id
      }' ORDER BY count DESC`,
      (err, result) => {
        res.send({ expense_types: result });
      }
    );
  });
};

exports.create = (req, res, next) => {
  function insertExpense(type_id, amount) {
    const date = getDate();
    const sql = `INSERT into expenses (user_id, amount, type_id, created_at, message) 
  VALUES ('${req.user._id}', '${amount}', '${type_id}', '${date}', '${
      req.body.message
    }')`;
    con.query(sql, (err, res) => {
      con.query(`UPDATE expense_types
        SET count = count + 1
        WHERE id = ${type_id}`);
      console.log(res);
    });
  }
  con.getConnection(er => {
    let type_id;
    if (+req.body['type_id'] <= 0) {
      const date = getDate();
      con.query(
        `INSERT into expense_types (name, created_at) 
        VALUES ('${req.body.name}', '${date}')`,
        (e, r) => {
          type_id = r.insertId;
          insertExpense(type_id, req.body.amount);
        }
      );
    } else {
      type_id = req.body.type_id;
      insertExpense(type_id, req.body.amount);
    }
    res.send();
  });
};

// exports.update = (req, res, next) => {
//   con.getConnection(er => {
//     con.query(
//       `SELECT * FROM expense WHERE id = ${req.params.id}`,
//       (err, result) => {
//         if (!result) {
//           res.send({ message: 'Expense not found.' });
//         } else {
//           con.query(
//             `UPDATE * FROM expenses WHERE id = ${req.params.id}`,
//             (e, r) => {
//               res.send({ expense_types: result });
//             }
//           );
//         }
//       }
//     );
//   });
// };

exports.delete = (req, res, next) => {
  console.log(req.params);
  con.query(
    `DELETE FROM expenses WHERE id = ${parseInt(req.params.id)}`,
    (err, result) => {
      res.send({ message: result });
    }
  );
};

function getDate() {
  let d = new Date().toISOString().split('T');
  return `${d[0]} ${d[1].split('.')[0]}`;
}
