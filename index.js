const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const PORT = process.env.PORT || 5000;
const app = express();
app.use(bodyParser.json());

//connect to SQL database
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'aditya',
    password: 'password',
    database: 'kubot'
});

connection.connect(function (err) {
    if (err) {
        return console.error('error connecting: ' + err.stack);
    }
    console.log("Connected to database");
});

if (process.argv[2] === '--init') {
    console.log('Initializing Tables');
    const { createStudentsTable, createTeachersTable, createClassTable } = require('./database/init');
    Promise.all([createStudentsTable(connection), createTeachersTable(connection)])
        .then((msg) => {
            return createClassTable(connection);
        })
        .then(msg => console.log(msg))
        .catch(err => console.log(err));
}

let webhookRoute = require('./Routes/webhook');
app.use('/webhook', webhookRoute);

app.listen(PORT, () => {
    console.log('Listening at', PORT)
});