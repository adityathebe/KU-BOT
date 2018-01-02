const fs = require ('fs');
const express = require('express');

// Facebook Tokens
const vtoken = process.env.VTOKEN;
const botID = '1997955997090908'

// Graph API Functions
const {sendMessage, sendQuickReplies, getUserData} = require('../Modules/apicalls');

// Utility Functions
const { subscribeStudent, registerTeacher } = require('../Modules/subscribe');
const { validate_teacher, validate_class } = require('../Modules/validation');
const { get_students_of_class, get_classes_of_teacher } = require('../Modules/validation');

// Utility Variables
let SUB_CONTEXT = {};
let NOTIFY_CONTEXT = {};
let REGISTER_CONTEXT = {};
let NOTIFY_CLASS_CONTEXT = {};

// Database Models
const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');

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
            } 

            else if (messageEvent.message.quick_reply) {
                let payload = messageEvent.message.quick_reply.payload;
                handle_quickReplies(sender, payload);
            }

            else if (messageEvent.message) {
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
    }

    if ( payload == 'PAYLOAD_REGISTER') {
        REGISTER_CONTEXT.sender = true;
        sendMessage(sender, 'Enter the code');
    }

    if ( payload == 'PAYLOAD_NOTIFY') {
        validate_teacher(sender)
            .then((teachers) => {
                get_classes_of_teacher(sender)
                    .then((classes) => {

                        NOTIFY_CONTEXT.sender = true;
                        let data = {}
                        data.text = "Choose your subject";
                        data.element = [];

                        classes.forEach((classs) => {
                            let temp_data = {
                                content_type: "text",
                                title: classs,
                                payload: classs
                            }
                            data.element.push(temp_data);
                        });

                        sendQuickReplies(sender, data)
                            .then((msg) => console.log(msg))
                            .catch((err) => console.log(err));
                    })
                    .catch((err) => {
                        console.log(err);
                    })

            })
            .catch((err) => {
                console.log(err);
                sendMessage(sender, "You're not authorized to send notifications")
            });
    }
}

function handleMessage (sender, message) {
    console.log('Message Received:', message);

    if (SUB_CONTEXT.sender) {
        handle_subscription(sender, message)
    } 

    else if (NOTIFY_CLASS_CONTEXT.sender) {
        class_code = NOTIFY_CLASS_CONTEXT.sender;
        handle_notification(sender, message, class_code);
    } 

    else if (REGISTER_CONTEXT.sender) {
        handle_registeration(sender, message);
    }

    else {
        if (message == 'registermeplease') {
            REGISTER_CONTEXT.sender = true;
            sendMessage(sender, 'Enter the code');
        }
        sendMessage(sender, 'Sorry I did not understand that.');
    }
}

function handle_quickReplies (sender, payload) {
    console.log("Quick Reply Payload Received:", payload);

    NOTIFY_CLASS_CONTEXT.sender = payload;
    sendMessage(sender, 'Enter your message');
    delete NOTIFY_CONTEXT.sender;
}


function handle_registeration (sender, message) {
    if (message == 'guitar') {
        // register Teacher
        registerTeacher(sender)
            .then((msg) => {
                sendMessage(sender, "You have been registered as teacher!");
                delete REGISTER_CONTEXT.sender;
            })  
            .catch((err) => {
                sendMessage(sender, err)
            })
    } else {
        sendMessage(sender, 'Wrong Code');
    }
}

function handle_subscription (sender, message) {
    validate_class(message)
        .then((msg) => {
            subscribeStudent(sender, message)
                .then((msg) => {
                    sendMessage(sender, msg)
                    delete SUB_CONTEXT.sender;
                })
                .catch((err) => sendMessage(sender, err));

        })
        .catch((err) => {
            sendMessage(sender, 'Invalid class code...');
        });
}

function handle_notification (sender, message, class_code) {
    get_students_of_class(class_code)
        .then((students) => {
            students.forEach((student) => {
                sendMessage(student.profileID, message);
            })
        })
        .catch((err) => {
            console.log(err);
        })
    
}

function validateCode (message) {
    return true;
}

module.exports = router