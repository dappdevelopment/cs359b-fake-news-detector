var express = require('express');
var router = express.Router();
// const sqlite3 = require('sqlite3').verbose();
//var mysql = require('mysql');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

/*  console.log("getting articles");
  var con = mysql.createConnection({
    host: "localhost",
    user: "fakenewsdetector",
    password: "KaO62ww0kuom0",
    database: "fakenewsdetector"
  });*/
  var message = {};
  message.txt = "success";
  res.json(message);


});

// router.get('/new', function(req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//   res.setHeader('Access-Control-Allow-Credentials', true);
//
//   var url = req.param('url');
//   var deadline = req.param('deadline');
//   var uid = req.param('uid');
//   message = {};
//   let db = new sqlite3.Database('db/fnd.db', (err) => {
//     if (err) {
//       return console.error(err.message);
//     }
//
//     let sql = 'SELECT * FROM articles WHERE url = "' + url + '"';
//     console.log(sql);
//
//     db.all(sql, [], (err, rows) => {
//       if (err) {
//         throw err;
//       }
//       if (rows.length == 0) {
//         sql = 'INSERT INTO articles(url, deadline, uid) VALUES("'+url+'","'+deadline+'","'+uid+'")';
//         db.all(sql, [], (err, rows) => {
//           message.message =  'inserted';
//           res.json(message);
//         });
//       } else {
//         message.message= 'exists';
//         res.json(message);
//       }
//     });
//   });
//   db.close((err) => {
//     if (err) {
//       return console.error(err.message);
//     }
//     console.log('Close the database connection.');
//   });
//
// });

module.exports = router;

