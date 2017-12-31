const fs = require ('fs');
const express = require('express');

// Facebook Tokens
const vtoken = process.env.VTOKEN;
const botID = '1997955997090908'

// Graph API Functions
const {sendMessage, getUserData} = require('../Modules/apicalls');

// Utility Functions
const { subscribeStudent, registerTeacher } = require('../Modules/subscribe');

// Utility Variables
let SUB_CONTEXT = {};
let NOTIFY_CONTEXT = {};

// Database Models
const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');
const ClassModel = require('../models/classroom');

let router = express.Router();

router.get('/', (req, res) => {
    let mode = req.query['hub.mode'];
    let challenge = req.query['hub.challenge'];
    let verifytoken = req.query['hub.verify_token'];
    
    if (verifytoken == vtoken) {
        console.log("verified")
        res.send(challenge)
    } else {
        console.log("wrong token")
        res.sendStatus(403)
    }
});

router.post('/', (req, res) => {

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

function handlePostback (sender, payload) {
    console.log("Payload Received:", payload);

    if (payload == 'PAYLOAD_SUBSCRIBE') {
        SUB_CONTEXT.sender = true;
        sendMessage(sender, 'Enter the code');
    } else if ( payload == 'PAYLOAD_NOTIFY') {
        // Check if user is authorized to send notifications
        if (isTeacher(sender)) {
            NOTIFY_CONTEXT.sender = true;
            sendMessage(sender, 'Enter the code');
        } else {
            sendMessage(sender, "You're not authorized to send notifications")
        }
    }
}

function handleMessage (sender, message) {
    console.log('Message Received:', message);

    if (SUB_CONTEXT.sender) {
        handle_subscription(sender, message)
    } else if (NOTIFY_CONTEXT.sender) {
        handle_notification(sender, message)
    } else {
        sendMessage(sender, 'Sorry I did not understand that.');
    }
}

function handle_subscription (sender, message) {
    if (validateCode(message)) {
        subscribeStudent(sender, message)
            .then((msg) => {
                sendMessage(sender, msg)
                delete SUB_CONTEXT.sender;
            })
            .catch((err) => sendMessage(sender, err));

    } else {
        sendMessage(sender, "Invalid Subscription Request!")
    }
}

function handle_notification (sender, message) {

}

function validateCode (message) {
    return true;
}

module.exports = router