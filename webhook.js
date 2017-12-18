//dependencies
const express = require('express');
const request = require('request');
const fs = require ('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// Facebook Tokens
const botID = '1997955997090908'
const fb_token = "helloworld";
const vtoken = "EAAD7x11SrrgBAA4lW3WZBzrhgJgiY8ZCye2Bc9xwVRkBtVAF5ZAk5uiFp9myWRXNxnb997HCfXJfDC3gRlQvSsk5x2ZAlSyiTy7rlPe7nyPJTqxQSemdTlZCXXaC4Nur3l03ME4vug0AOUYjZADsrAoQfozber8v3OPiqmdimRweY4y6ZB56pNZB";

const PORT = process.env.PORT || 5000;
let context = {};

//connect to mongodb database
if (process.env.NODE_ENV === 'production') {
    mongoose.connect("mongodb://admin:password@ds021016.mlab.com:21016/kubot" , {useMongoClient: true});
} else {
    mongoose.connect("mongodb://localhost/ku-bot",{useMongoClient:true});  
}

mongoose.Promise = global.Promise;
let db = mongoose.connection;
    db.on('error',(err) => {
        console.log(err);
    })
    .once('open',() => {
        console.log('connected to database');
    })

const TeacherModel = require('./models/teacher');
const StudentModel = require('./models/student');

const app = express();
app.use(bodyParser.json());

app.get('/webhook', (req, res) => {

    let mode = req.query['hub.mode'];
    let challenge = req.query['hub.challenge'];
    let verifytoken = req.query['hub.verify_token'];
    
    if(verifytoken == fb_token) {
        console.log("verified")
        res.send(challenge)
    } else {
        console.log("wrong token")
        res.sendStatus(403)
    }
});

app.post('/webhook', (req, res) => {

    if (req.body.entry[0].messaging) {

        let messageEvent = req.body.entry[0].messaging[0];
        let sender = messageEvent.sender.id;
        let recipient = messageEvent.recipient.id;

        // Ignore delivery reports
        if (!messageEvent.delivery && sender != botID) {

            // Check for Postbacks
            if ( messageEvent.postback ) {
                let payload = messageEvent.postback.payload;
                handlePostback(sender, payload)
            } else if (messageEvent.message) {
                let message = messageEvent.message.text;
                handleMessage(sender, message);
            }
        }   
    }
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log('Listening at', PORT)
});

// Function to handle message
function handleMessage (sender, message) {
    console.log('Message Received:', message);

    if (context.sender) {
        subscribeStudent(sender, message)
        sendMessage(sender, 'You have been subscribed!');
        delete context.sender;
    } else {
        let reply = 'echo: ' + message;
        sendMessage(sender, reply);
    }
}

// Handle Postback Messages
function handlePostback (sender, payload) {
    console.log("Payload Received:", payload);

    if (payload == 'PAYLOAD_SUBSCRIBE') {
        context.sender = true;
        sendMessage(sender, 'Enter the code');
    }
}

function subscribeStudent (sender, subscription) {

    let student = new StudentModel();
    student.profileID = sender;
    student.cr = false;

    // Fetch the list of all students
    StudentModel.find({}, (err, students) => {

        let studentList = students.filter((stu) => {
            return stu.profileID === student.profileID
        });

        if (studentList.length > 0) {
            // Update database
            let updatedData = {
                "$push" : {
                    subscribed_to: subscription
                }
            };

            StudentModel.update({profileID: student.profileID}, updatedData, (err) => {
                if (err) console.log(err)
                else console.log("Student data updated!");
            });
        } else {
            // save
            student.subscribed_to = subscription;
            student.save( (err) => {
                if (err) console.log(err)
                else console.log('New Student saved!');
            });
        }
    });
}

// Functions to send message
function sendMessage(receiver, msg_text) {
    let msgObj = {
        recipient: {
            id: receiver
        },
        message : {
            text: msg_text
        } 
    }
    
    callAPI(msgObj);
}

function callAPI(request_body) {
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": vtoken },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err && res.statusCode == 200) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    }); 
}
