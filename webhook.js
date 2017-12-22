//dependencies
const express = require('express');
const request = require('request');
const fs = require ('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const stringSimilarity = require('string-similarity');

const {sendMessage, getUserData} = require('./functions');

// Facebook Tokens
const botID = '1997955997090908'
const vtoken = process.env.VTOKEN;

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
    
    if(verifytoken == vtoken) {
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
        // Check if the code is valid
        if (validateCode(message)) {
            subscribeStudent(sender, message);
            delete context.sender;
        } else {
            sendMessage(sender, "Sorry we couldn't find that subject!")
            let suggestions = suggestCode(message);
            if (suggestions.length > 0) {
                let reply = "Did you mean\n";
                suggestions.forEach((sub, index) => {
                    reply += `\n${index + 1}. ${sub.name} - ${sub.code}`;
                })
                reply += "\n\n?";
                sendMessage(sender, reply);
            }
        }
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
            getUserData(sender, (name) => {
                student.name = name;
                student.save( (err) => {
                    if (err) console.log(err)
                    else console.log('New Student saved!');
                });
            });
        }

        sendMessage(sender, 'You have been subscribed!');
    });
}

const subjects = [
    { name: "Object Oriented Programming", code: "COMP 104" }, 
    { name: "Advanced Calculus", code: "MATH 104" },
    { name: "Probability and Statistics", code: "MATH 208" },
    { name: "Communication Skills I", code: "ENGT 101" },
    { name: "Communication Skills II", code: "ENGT 102" },
    { name: "Discrete Mathematics", code: "MCSC 201" },
    { name: "Numerical Methods", code: "MCSC 202" },
    { name: "Data Structures and Algorithms", code: "COMP 202" }
]

const validateCode = (msg) => {
    let found = subjects.filter((sub) => {
        return sub.code == msg;
    })
    return found.length > 0 ? true : false;
}

const suggestCode = (msg) => {
    let matchedCode = subjects.filter((sub) => {
        return stringSimilarity.compareTwoStrings(sub.code, msg) > 0.6;
    })
    return matchedCode;
}