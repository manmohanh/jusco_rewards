const mysql = require('mysql');

const connection = mysql.createConnection({
    host:"localhost",
    user:"rewards",
    password:"rewards",
    database:"rewards"

})

connection.connect((err)=> {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }
      console.log('connected');
});

module.exports = connection;
