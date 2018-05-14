var express = require('express');
var app = express();
var mysql = require('mysql');
var getTitleAtURL = require('get-title-at-url');

const con = mysql.createConnection({
  host: "localhost",
  user: "fakenewsdetector",
  password: "KaO62ww0kuom0",
  database: "fakenewsdetector"
});

app.get('/fakenewsdetector/articles', function(req,res) {
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
  console.log('Example app listening on port 3000!');
  
});

