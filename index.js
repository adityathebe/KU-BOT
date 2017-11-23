const express = require('express');
const bodyParser = require('body-parser');

// Facebook Tokens
const fb_token = "helloworld";

// Our Messaging Functions
const {sendMessage, getUserData} = require('./functions');

const PORT = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hey There !');
});

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
})

app.post('/webhook', (req, res) => {
    if (req.body.entry[0].messaging) {
        let messageEvent = req.body.entry[0].messaging[0];
        let sender = messageEvent.sender.id;
        let recipient = messageEvent.recipient.id;
        console.log(JSON.stringify(messageEvent, null, 4))

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

app.listen(PORT, () => {
    console.log('Listening at', PORT)
});

let database = {
    teachers : [{
        name: 'Aditya Thebe',
        code: 'ATL',
        id: 1396624087087889,
        sub: ['COMP','PHYS','CHEM']
    }, {
        name: 'Jonesh Shrestha',
        code: 'JS',
        id: 1560680210634754,
        sub: ['MATH','SCIENCE']
    }],
    students : []
}

function handleMessage(sender, message) {
    console.log('Message:', message)

    if (isTeacher(sender)) {
        let teacher = isTeacher(sender);
        let msg = teacher.name + ': ' + message;
        for (student of database.students) {
            sendMessage(student, msg);
        }
    } else {
        if (message.search('sub') == 0) {
            let fragments = message.split(' ');
            let teacher_code = fragments[1];
            let sub_code = fragments[2];
            // sub ATL MATH

        }
        sendMessage(sender, 'you are not authorized');
    }
}

function isTeacher(sender) {
    for (teacher of database.teachers) {
        if (teacher.id == sender) {
            return teacher;
        } 
    }
    return false;
}

function handlePostback(sender, payload) {
    if (payload == 'PL_sub_student') {
        database.students.push(sender)
    }
    sendMessage(sender, 'You have been subscribed!');
}

function checkAttachment(sender, message) {

}