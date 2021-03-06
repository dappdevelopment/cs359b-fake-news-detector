var express = require('express');
var app = express();
var mysql = require('mysql');
var getTitleAtURL = require('get-title-at-url');

const con = mysql.createConnection({
  /* For server */
    host: "localhost",
    user: "fakenewsdetector",
    password: "KaO62ww0kuom0",
    database: "fakenewsdetector"

  /* For local */
  // host: "localhost",
  // user: "root",
  // password: "pwd",
  // database: "fakenewsdetector",
  // insecureAuth : true
});

app.get('/fakenewsdetector/articles_open', function(req,res) {
 res.setHeader('Access-Control-Allow-Origin', '*');
 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
 res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
 res.setHeader('Access-Control-Allow-Credentials', true);
  var sql = 'SELECT * FROM articles WHERE is_open = TRUE ORDER BY deadline';
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

app.get('/fakenewsdetector/articles_closed', function(req,res) {
 res.setHeader('Access-Control-Allow-Origin', '*');
 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
 res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
 res.setHeader('Access-Control-Allow-Credentials', true);
  var sql = 'SELECT * FROM articles WHERE is_open = FALSE ORDER BY deadline';
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

app.get('/fakenewsdetector/reporters', function(req,res) {
 res.setHeader('Access-Control-Allow-Origin', '*');
 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
 res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
 res.setHeader('Access-Control-Allow-Credentials', true);
  var sql = 'SELECT * FROM reporters ORDER BY deadline';
  con.query(sql, function (err, results) {
    if (err) throw err;
    var articles = [];
    results.forEach((row) => {
      var article = {};
      article.reporter = row.address;
      article.url = row.url;
      article.deadline = row.deadline;
      article.title = row.title;
      articles.push(article);
    });
    res.json(articles);
  });
});

app.get('/fakenewsdetector/assign_reporter', function(req,res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  var address = req.param('address');
  var deadline = req.param('deadline');
  var url = req.param('url');
  var message = {};
  var title = getTitleAtURL(url, function(title) {
    if (title == '') title = url;
    var sql = 'INSERT INTO reporters(address, url, title, deadline) VALUES("'+address+'","'+url+'","'+title+'","'+deadline+'")';
    con.query(sql, function (err, results) {
      if (err) throw err;
    });
    message.message = "inserted";
    res.json(message);
  });
});

app.get('/fakenewsdetector/post_article', function(req,res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  var url = req.param('url');
  var deadline = req.param('deadline');
  var message = {};
  var title = getTitleAtURL(url, function(title) {
    if (title == '') title = url;
    var sql = 'INSERT INTO articles(url, deadline, title, is_open, consensus) VALUES("'+url+'","'+deadline+'","'+title+'",TRUE, 3)';
    console.log(sql);
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


module.exports = app;
