const mysql = require('mysql');

//connect to SQL database
let connection = mysql.createConnection({
    host: '0.0.0.0',
    user: 'aftab03',
    password: '',
    database: 'kubot'
});

connection.connect(function (err) {
    if (err) {
        return console.error('error connecting: ' + err.stack);
    }
    console.log("Connected to database");
});

module.exports = connection;