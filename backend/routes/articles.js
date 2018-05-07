var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3').verbose();


/* GET users listing. */
router.get('/', function(req, res, next) {

  // Website you wish to allow to connect
   res.setHeader('Access-Control-Allow-Origin', '*');

   // Request methods you wish to allow
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

   // Request headers you wish to allow
   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

   // Set to true if you need the website to include cookies in the requests sent
   // to the API (e.g. in case you use sessions)
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
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Close the database connection.');
  });

});

module.exports = router;
