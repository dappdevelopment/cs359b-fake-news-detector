var express = require('express');
var app = express();

app.get('/fakenewsdetector/hello', function (req, res) {
  res.send('Hello World!');
});
app.get('/fakenewsdetector/articles', function(req,res) {
  var con = mysql.createConnection({
  host: "localhost",
  user: "fakenewsdetector",
  password: "KaO62ww0kuom0",
  database: "fakenewsdetector"
});
res.send('Hello World!');

//
// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   con.query("CREATE DATABASE fnd", function (err, result) {
//     if (err) throw err;
//     console.log("Database created");
//   });
//   var sql = "CREATE TABLE articles (url VARCHAR(255), deadline VARCHAR(255))";
//    con.query(sql, function (err, result) {
//      if (err) throw err;
//      console.log("Table created");
//    });
//    var sql = "INSERT INTO articles (url, deadline) VALUES ('https://www.cnn.com/', '07-05-2018')";
//   con.query(sql, function (err, result) {
//     if (err) throw err;
//     console.log("1 record inserted");
//   });
//   var sql = 'SELECT * FROM articles ORDER BY deadline';
//   con.query(sql, function (err, result) {
//     if (err) throw err;
//     result.forEach((row) => {
//       console.log(row.first_name);
//       articles.push(row);
//     });
//
//     res.jsonp(articles);
//   });
// });
//
// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   var sql = 'SELECT * FROM articles ORDER BY deadline';
//   con.query(sql, function (err, result) {
//     if (err) throw err;
//     result.forEach((row) => {
//       console.log(row.first_name);
//       articles.push(row);
//     });
//
//     res.jsonp(articles);
//   });
// });
//
//   let sql = 'SELECT * FROM articles ORDER BY deadline';
//   var articles = [];
//   db.all(sql, [], (err, rows) => {
//     if (err) {
//       throw err;
//     }
//     rows.forEach((row) => {
//       console.log(row.first_name);
//       articles.push(row);
//     });
//     console.log(articles);
//     res.jsonp(articles);
//   });
//
// });
// // close the database connection
// db.close((err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('Close the database connection.');
// });
//
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


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');
//
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var articlesRouter = require('./routes/articles');
//
// var app = express();
//
// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
//
// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
//
// app.use('./', indexRouter);
// app.use('./users', usersRouter);
// app.use('./articles',articlesRouter);
//
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
// app.use(function(req, res, next) {
//
// });
// // error handler
// app.use(function(err, req, res, next) {
//
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });
//
// module.exports = app;
