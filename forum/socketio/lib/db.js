var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '7979',
  database : 'my_db'
});
 
connection.connect();

// function wordSearching()


module.exports = connection;