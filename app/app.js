var express = require('express');
var app = express();
var mysql = require('mysql');
<<<<<<< HEAD

const con = mysql.createConnection({
  host: "localhost",
  user: "fakenewsdetector",
  password: "KaO62ww0kuom0",
  database: "fakenewsdetector"
});
con.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});

app.get('/fakenewsdetector/hi', function (req, res) {
  res.send('fml!!!!!');
});

app.get('/fakenewsdetector/articles', function(req, res) {
    console.log('HITTING ARTICLES ENDPOINT');
    var sql = 'SELECT url, deadline FROM articles ORDER BY deadline';
    con.query(sql, function (err, rows, fields) {
      con.end();
      if (err) throw err;
      else console.log('Results from query: ', rows);
    });
    res.send('QUERIED SUCCESSFULLY');
 });

app.listen(3001, function () {
=======
var getTitleAtURL = require('get-title-at-url');

const con = mysql.createConnection({
  /* For server */
   host: "localhost",
   user: "fakenewsdetector",
   password: "KaO62ww0kuom0",
   database: "fakenewsdetector"

  /* For local */
/*  host: "localhost",
  user: "root",
  password: "pwd",
  database: "fakenewsdetector",
  insecureAuth : true*/
});

app.get('/fakenewsdetector/articles', function(req,res) {
 res.setHeader('Access-Control-Allow-Origin', '*');
 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
 res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
 res.setHeader('Access-Control-Allow-Credentials', true);
  var sql = 'SELECT * FROM articles ORDER BY deadline';
  con.query(sql, function (err, results) {
    if (err) throw err;
    var articles = [];
    results.forEach((row) => {
      var article = {};
      article.url = row.url;
      article.deadline = row.deadline;
      article.title = row.title;
      articles.push(article);
    });
    res.json(articles);
  });
});

app.get('/fakenewsdetector/post_article', function(req,res) {
  var url = req.param('url');
  var deadline = req.param('deadline');
  var message = {};
  var title = getTitleAtURL(url, function(title) {
    if (title == '') title = url;
    var sql = 'INSERT INTO articles(url, deadline, title) VALUES("'+url+'","'+deadline+'","'+title+'")';
    con.query(sql, function (err, results) {
      if (err) throw err;
    });
    message.message = "inserted";
    res.json(message);
  });
});

app.listen(3000, function () {
>>>>>>> 2975781dbd6aa0355244d44bbae83ee10c49d153
  console.log('Example app listening on port 3000!');

<<<<<<< HEAD
=======
});
>>>>>>> 2975781dbd6aa0355244d44bbae83ee10c49d153
module.exports = app;
