//dependencies
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

// Facebook Tokens
const fb_token = "helloworld";

// Our Messaging Functions
const {sendMessage, getUserData} = require('./functions');

// Database
const teachers = require('./teachers');
let Records = require('./database');

//setting environment variable to listen to port 3000
const PORT = process.env.PORT || 3000;
//initializing app express
const app = express();
//tells the system that we want json to be used
app.use(bodyParser.json());

//respond with 'Hey There !' when a GET request is made to the homepage
app.get('/', (req, res) => {
    res.send('Hey There !');
});

//respond with challenge when a GET request is verified to the webhook else return 403 error
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

//A POST request is used to send data to the server
app.post('/webhook', (req, res) => {

    res.sendStatus(200);
    if (req.body.entry[0].messaging) {
        let messageEvent = req.body.entry[0].messaging[0];
        let sender = messageEvent.sender.id;
        let recipient = messageEvent.recipient.id;

        if (messageEvent.message) {
            let message = messageEvent.message.text;
            handleMessage(sender, message);
        }
        
        if (messageEvent.postback) {
            let payload = messageEvent.postback.payload;
            handlePostback(sender, payload)
        }
    }
});

//listens for connections on the specified port
app.listen(PORT, () => {
    console.log('Listening at', PORT)
});

//user defined function to handel message request
function handleMessage(sender, message) {
    console.log('Message:', message)

    if (isTeacher(sender)) {
        let teacher = isTeacher(sender);
        let teacher_code = teacher.code;
        let msg_data = message.split(' => ');
        let sub_code = msg_data[0];
        let msg = msg_data[1];

        // Fetch All students of given teacher of given subject
        let database = JSON.parse(fs.readFileSync('database.json', 'utf8'));
        let students = database[teacher_code][sub_code];
        //counts the number of students to whom message is delivered
        let count = 0;
        for (student of students) {
            sendMessage(student, msg);
            count++;
        }
        sendMessage(sender, 'your message has been sent to ' + count + ' students');
    } else {
        if (message.search('sub') == 0) {

            try {
                let fragments = message.split(' ');
                let teacher_code = fragments[1];
                let sub_code = fragments[2];


                storeStudent(teacher_code, sub_code, sender);
            } catch (err) {
                console.log(err.msg)

                sendMessage(sender, 'Invalid Syntax');
            }
        }
    }
}

function isTeacher(sender) {
    let teachers = require('./teachers')
    for (teacher of teachers) {
        if (teacher.id == sender) {
            return teacher;
        } 
    }
    return false;
}

function handlePostback(sender, payload) {
    if (payload == 'PL_sub_student') {
        console.log('Payload Received!')
    }
}

function checkAttachment(sender, message) {

}

function storeStudent (teacher_id, sub_code, student_id) {
    let records = JSON.parse(fs.readFileSync('database.json', 'utf8'));
    let data = records[teacher_id][sub_code];
    if (data) {
        records[teacher_id][sub_code].push(student_id);
        fs.writeFileSync('database.json', JSON.stringify(records, null, 4), 'utf8');
    }
}