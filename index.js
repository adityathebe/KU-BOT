const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 5000;

//connect to mongodb database
mongoose.connect("mongodb://admin:password@ds021016.mlab.com:21016/kubot" , {useMongoClient: true});

mongoose.Promise = global.Promise;
let db = mongoose.connection;
    db.on('error',(err) => {
        console.log(err);
    })
    .once('open',() => {
        console.log('connected to database');
    })

const app = express();
app.use(bodyParser.json());

let webhookRoute = require('./Routes/webhook');
app.use('/webhook', webhookRoute);

app.listen(PORT, () => {
    console.log('Listening at', PORT)
});