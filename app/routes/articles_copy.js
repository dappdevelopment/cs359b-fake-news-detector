var express = require('express');
var getTitleAtURL = require('get-title-at-url');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);


  let db = new sqlite3.Database('db/fnd.db', (err) => {
    if (err) {
      return console.error(err.message);
    }


    let sql = 'SELECT * FROM articles ORDER BY deadline';
    var articles = [];
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach((row) => {
        console.log(row.first_name);
        articles.push(row);
      });
      console.log(articles);
      res.jsonp(articles);
    });

  });
  // close the database connection
  // db.close((err) => {
  //   if (err) {
  //     return console.error(err.message);
  //   }
  //   console.log('Close the database connection.');
  // });

});

router.get('/new', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  var url = req.param('url');
  var deadline = req.param('deadline');
  message = {};
  let db = new sqlite3.Database('db/fnd.db', (err) => {
    if (err) {
      return console.error(err.message);
    }

    let sql = 'SELECT * FROM articles WHERE url = "' + url + '"';
    console.log(sql);

    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      if (rows.length == 0) {
        var title = getTitleAtURL(url, function(title) {
          sql = 'INSERT INTO articles(url, deadline, title) VALUES("'+url+'","'+deadline+'","'+title+'")';
          console.log(sql);
          db.all(sql, [], (err, rows) => {
            if (err) {
              throw err;
            }
            message.message =  'inserted';
            res.json(message);
          });
        });

      } else {
        message.message= 'exists';
        res.json(message);
      }
    });
  });
  // db.close((err) => {
  //   if (err) {
  //     return console.error(err.message);
  //   }
  //   console.log('Close the database connection.');
  // });

});

module.exports = router;
