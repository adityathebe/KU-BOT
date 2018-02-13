const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 5000;
const app = express();
app.use(bodyParser.json());

const connection = require('./database/init');

let webhookRoute = require('./Routes/webhook');
app.use('/webhook', webhookRoute);

app.listen(PORT, () => {
    console.log('Listening at', PORT)
});

module.exports = connection;