var express = require('express');
var app = express();
var mysql = require('mysql');

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
  console.log('Example app listening on port 3000!');
});

module.exports = app;
