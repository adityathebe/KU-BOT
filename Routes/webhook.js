const fs = require('fs');
const express = require('express');

// Facebook Tokens
const vtoken = 'helloworld';
const botID = '1997955997090908'

// Graph API Functions
const { sendMessage, sendAttachment, sendQuickReplies, sendGenericMessage, getUserData } = require('../Modules/apicalls');

// Utility Functions
const { addNewStudent, addNewTeacher, addNewClass, addToClassroom } = require('../database/subscribe');
const { validate_teacher, validate_student, validate_cr, validate_class, validate_teacher_cr } = require('../database/validation');
const { get_students_of_class, get_classes_of_teacher, get_classes_of_student, get_teachers_of_class } = require('../database/utils');
const { getKUNews } = require('../utilities/kurss');

// Utility Variables
let SUB_CONTEXT = {};
let TEACHER_NOTIFY_CONTEXT = {};
let CR_NOTIFY_CONTEXT = {};
let REGISTER_CONTEXT = {};
let NOTIFY_CLASS_CONTEXT = {};
let CLASS_ADDITION_CONTEXT = {};
let NOTIFY_TEACHER_CONTEXT = {};

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

            if (messageEvent.postback) {
                let payload = messageEvent.postback.payload;
                handlePostback(sender, payload)
            }

            else if (messageEvent.message.quick_reply) {
                let payload = messageEvent.message.quick_reply.payload;
                handle_quickReplies(sender, payload);
            }

            else if (messageEvent.message.text) {
                let message = messageEvent.message.text;
                handleMessage(sender, message);
            }

            else if (messageEvent.message.attachments) {
                let attachments = messageEvent.message.attachments;
                attachments.forEach((attachment) => {
                    let type = attachment.type;
                    let payload = attachment.payload.url;
                    sendAttachment(sender, type, payload);
                });
            }
        }
    }
    res.sendStatus(200);
});

function handlePostback(sender, payload) {
    console.log("Payload Received:", payload);

    if (payload == 'PAYLOAD_SUBSCRIBE') {
        SUB_CONTEXT[sender] = true;
        sendMessage(sender, 'Enter the code');
    }

    else if (payload == "ADD_CLASS") {
        validate_teacher(sender)
            .then((response) => {
                if (response) {
                    sendMessage(sender, 'Set a code for your new class');
                    CLASS_ADDITION_CONTEXT[sender] = true;
                } else {
                    sendMessage(sender, 'Sorry you are not a teacher!');
                }
            })
            .catch(err => console.log(err));
    }

    else if (payload == 'REGISTER_TEACHER') {
        validate_teacher(sender)
            .then((response) => {
                if (response) {
                    sendMessage(sender, "You have already been registered as a teacher.")
                } else {
                    REGISTER_CONTEXT[sender] = true;
                    sendMessage(sender, 'Enter the code');
                }
            });
    }

    else if (payload == 'REGISTER_STUDENT') {
        validate_student(sender)
            .then((response) => {
                if (response) {
                    sendMessage(sender, "You have already been registered as a student.")
                } else {
                    getUserData(sender)
                        .then(name => addNewStudent({ id: sender, name, cr: 'F' }))
                        .then(msg => sendMessage(sender, "You have been subscribed!"))
                        .catch(err => console.log(err));
                }
            });
    }

    else if (payload == 'TEACHER_NOTIFY') {
        validate_teacher(sender)
            .then((teacher) => {
                if (teacher) {
                    return get_classes_of_teacher(sender);
                }
                throw ('Not Teacher');
            })
            .then((classes) => {

                TEACHER_NOTIFY_CONTEXT[sender] = true;
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
                if (err == "Not Teacher") {
                    sendMessage(sender, "You're not a teacher !")
                } else {
                    console.log(err);
                    sendMessage(sender, "Sorry some error occurred")
                }
            });
    }

    else if (payload == 'CR_NOTIFY') {
        validate_cr(sender)
            .then((cr) => {
                if (cr) {
                    return get_classes_of_student(sender);
                }
                throw ('Not CR');
            })
            .then((classes) => {

                CR_NOTIFY_CONTEXT[sender] = true;
                let data = {}
                data.text = "Choose your class";
                data.element = [];

                classes.forEach((classs) => {
                    let temp_data = {
                        content_type: "text",
                        title: classs,
                        payload: `${classs}_student`
                    }
                    data.element.push(temp_data);
                });

                if (data.element.length > 0) {
                    sendQuickReplies(sender, data)
                        .then((msg) => console.log(msg))
                        .catch((err) => console.log(err));
                } else {
                    sendMessage(sender, "Sorry you aren't part of any classes")
                }
            })
            .catch((err) => {
                if (err == "Not CR") {
                    sendMessage(sender, "You're not a class representative !")
                } else {
                    console.log(err);
                    sendMessage(sender, "Sorry some error occurred")
                }
            });
    }
}

function handleMessage(sender, message) {
    console.log('Message Received:', message);

    if (SUB_CONTEXT[sender]) {
        handle_subscription(sender, message)
    }

    else if (NOTIFY_CLASS_CONTEXT[sender]) {
        let class_code = NOTIFY_CLASS_CONTEXT[sender];
        handle_notification(sender, message, class_code);
        delete NOTIFY_CLASS_CONTEXT[sender];
    }

    else if (NOTIFY_TEACHER_CONTEXT[sender]) {
        let class_code = NOTIFY_TEACHER_CONTEXT[sender];
        handleCRNotification(sender, message, class_code);
        delete NOTIFY_TEACHER_CONTEXT[sender];
    }

    else if (REGISTER_CONTEXT[sender]) {
        handle_registeration(sender, message);
    }

    else if (CLASS_ADDITION_CONTEXT[sender]) {
        addNewClass(message, sender)
            .then((msg) => {
                sendMessage(sender, 'Your class has been added!');
                delete CLASS_ADDITION_CONTEXT[sender];
            })
            .catch((err) => {
                if (err.code == 'ER_DUP_ENTRY') {
                    sendMessage(sender, 'Sorry this class code has already been taken !')
                } else {
                    sendMessage(sender, 'Sorry We had an error');
                }
                delete CLASS_ADDITION_CONTEXT[sender];
            })
    }

    else if (message.toUpperCase().trim() == 'KU NEWS') {

        getKUNews()
            .then((news) => {
                return sendGenericMessage(sender, news);
            })
            .then((msg) => console.log(msg))
            .catch(err => console.log(err))
    }

    else {
        sendMessage(sender, "Sorry I couldn't understand that")
            .then((msg) => console.log(msg))
            .catch(err => console.log(err));
    }

}

function handle_quickReplies(sender, payload) {
    console.log("Quick Reply Payload Received:", payload);

    if (payload.search('_student') > 0) {
        NOTIFY_TEACHER_CONTEXT[sender] = payload.replace('_student', '');
        sendMessage(sender, 'Enter your message');
        delete CR_NOTIFY_CONTEXT[sender];
    }

    else {
        NOTIFY_CLASS_CONTEXT[sender] = payload;
        sendMessage(sender, 'Enter your message');
        delete TEACHER_NOTIFY_CONTEXT[sender];
    }
}

// Register Teacher
async function handle_registeration(sender, message) {
    if (message.toLowerCase().trim() == 'kuteachers') {
        try {
            let name = await getUserData(sender);
            await addNewTeacher({ id: sender, name });
            await sendMessage(sender, "You have been registered as a teacher!");
            let welcome_msg_teacher = `You can now add new classes and send notifications by using the persistence menu to the left. \n\nThank you`;
            await sendMessage(sender, welcome_msg_teacher);
            delete REGISTER_CONTEXT[sender];
        } catch (error) {
            console.log(error)
            sendMessage(sender, 'error')
        }
    } else {
        sendMessage(sender, 'Wrong Code');
    }
}

function handle_subscription(sender, message) {
    validate_class(message)
        .then((msg) => {
            if (msg) {
                addToClassroom(message, sender)
                    .then((msg) => {
                        sendMessage(sender, 'You have been subscribed!');
                        delete SUB_CONTEXT[sender];
                    })
                    .catch((err) => {
                        if (err.message.search('ER_DUP_ENTRY') >= 0) {
                            sendMessage(sender, 'You are already registered to this class!')
                        } else {
                            console.log(err.message)
                            sendMessage(sender, 'Some error occurred !');
                        }
                        delete SUB_CONTEXT[sender];
                    });
            } else {
                delete SUB_CONTEXT[sender];
                sendMessage(sender, 'Invalid class code...');
            }
        })
        .catch((err) => {
            console.log(err);
            sendMessage(sender, 'There was some error while subscribing.');
        });
}

function handle_notification(sender, message, class_code) {
    get_students_of_class(class_code)
        .then((students) => {
            if (students.length > 0) {
                let msg = `${class_code}: ${message}`
                students.forEach((student) => {
                    sendMessage(student, msg);
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

function handleCRNotification(sender, message, class_code) {
    get_teachers_of_class(class_code)
        .then((teachers) => {
            if (teachers.length > 0) {
                let msg = `${class_code}: ${message}`;
                teachers.forEach((teacher) => {
                    sendMessage(teacher.teacher_id, msg);
                });
                sendMessage(sender, 'Your message has been sent');
            } else {
                sendMessage(sender, 'Sorry, this class has no teachers.');
            }

        })
        .catch((err) => {
            console.log(err);
        })
}

module.exports = router