const fs = require ('fs');
const express = require('express');

// Facebook Tokens
const vtoken = process.env.VTOKEN;
const botID = '1997955997090908'

// Graph API Functions
const {sendMessage, sendQuickReplies, getUserData} = require('../Modules/apicalls');

// Utility Functions
const { subscribeStudent, registerTeacher } = require('../Modules/subscribe');
const { register_class } = require('../Modules/subscribe');
const { validate_teacher, validate_class, validate_teacher_CR } = require('../Modules/validation');
const { get_students_of_class, get_classes_of_teacher } = require('../Modules/validation');
const { news } = require('../utilities/kurss');

// Utility Variables
let SUB_CONTEXT = {};
let NOTIFY_CONTEXT = {};
let REGISTER_CONTEXT = {};
let NOTIFY_CLASS_CONTEXT = {};
let CLASS_ADDITION_CONTEXT = {};

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
        validate_teacher_CR(sender)
            .then((person) => {

                if (person == 'Teacher') {
                    get_classes_of_teacher(sender)
                        .then((classes) => {

                            NOTIFY_CONTEXT.sender = true;
                            let data = {}
                            data.text = "Choose your class";
                            data.element = [];

                            classes.forEach((classs) => {
                                let temp_data = {
                                    content_type: "text",
                                    title: classs,
                                    payload: classs
                                }
                                data.element.push(temp_data);
                            });

                            if (data.element.length > 0) {
                                sendQuickReplies(sender, data)
                                    .then((msg) => console.log(msg))
                                    .catch((err) => console.log(err));
                            } else {
                                sendMessage(sender, "Sorry you haven't registered any classes")  
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                } else if (person == 'cr') {

                }
                
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
        delete NOTIFY_CLASS_CONTEXT.sender;
    } 

    else if (REGISTER_CONTEXT.sender) {
        handle_registeration(sender, message);
    }

    else if (CLASS_ADDITION_CONTEXT.sender) {
        register_class(sender, message)
            .then((msg) => {
                sendMessage(sender, msg);
                delete CLASS_ADDITION_CONTEXT.sender;
            })
            .catch((err) => {
                sendMessage(sender, err);
            })
    }

    else if (message.toUpperCase().trim() == 'HELP') {

        let quick_replies_data = {
            text: "Choose the command",
            element :[{
                content_type: "text",
                title: 'Add Class',
                payload: 'PAYLOAD_ADD_CLASS'
            }]
        }

        sendQuickReplies(sender, quick_replies_data)
            .then((msg) => console.log(msg))
            .catch((err) => console.log(err));
    }

    else if (message.toUpperCase().trim() == 'KU NEWS') {

        getKUNews()
            .then((news) => {
                sendGenericMessage(sender, news);
            })
    }


function handle_quickReplies (sender, payload) {
    console.log("Quick Reply Payload Received:", payload);

    if (payload == 'PAYLOAD_ADD_CLASS') {
        sendMessage(sender, 'Enter new class code');
        CLASS_ADDITION_CONTEXT.sender = true;
    }

    else {   
        NOTIFY_CLASS_CONTEXT.sender = payload;
        sendMessage(sender, 'Enter your message');
        delete NOTIFY_CONTEXT.sender;
    }
}

async function handle_registeration (sender, message) {
    if (message.toLowerCase().trim() == 'kuteachers') {
        // register Teacher
        try {
            await registerTeacher(sender)
            await sendMessage(sender, "You have been registered as a teacher!");
            let welcome_msg_teacher = "You can now add new classes by HELP command.\n"
                welcome_msg_teacher += "To send notices to classes you can use the menu on the left side.\n\n"
                welcome_msg_teacher += "Thank you"
            await sendMessage(sender, welcome_msg_teacher);
            delete REGISTER_CONTEXT.sender;
        } catch(error) {
            sendMessage(sender, error)
        }
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
            if (students.length > 0) {
                students.forEach((student) => {
                    sendMessage(student.profileID, message);
                });
                sendMessage(sender, 'Your message has been sent');
            } else {
                sendMessage(sender, 'Sorry, this class has no students.');
            }

        })
        .catch((err) => {
            console.log(err);
        })
    
}

function validateCode (message) {
    return true;
}

module.exports = router