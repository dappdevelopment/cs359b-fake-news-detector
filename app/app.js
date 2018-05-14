var express = require('express');
var app = express();
var mysql = require('mysql');
var getTitleAtURL = require('get-title-at-url');

var con = mysql.createConnection({
  // host: "localhost",
  // user: "fakenewsdetector",
  // password: "KaO62ww0kuom0",
  // database: "fakenewsdetector"
  host: "localhost",
  user: "root",
  password: "pwd",
  database: "fakenewsdetector",
  insecureAuth : true
});

app.get('/fakenewsdetector/articles', function(req,res) {
  var articles = [];
  var article = {};
  var sql = 'SELECT * FROM articles ORDER BY deadline';
  con.query(sql, function (err, results) {
    if (err) throw err;
    results.forEach((row) => {
      article.title = row.title;
      article.url = row.url;
      article.deadline = row.deadline;
      articles.push(article);
    });
    res.json(articles);
  });
});

app.get('/fakenewsdetector/post', function(req,res) {
  var url = req.param('url');
  var deadline = req.param('deadline');
  var message = {};
  var title = getTitleAtURL(url, function(title) {
    if (title == '') title = url;
    var sql = 'INSERT INTO articles(url, deadline, title) VALUES("'+url+'","'+deadline+'","'+title'")';
    con.query(sql, function (err, results) {
      if (err) throw err;
    });
    message.message = "inserted";
    res.json(message);
  });
});




app.listen(3001, function () {
  console.log('Example app listening on port 3001!');
});

module.exports = app;
