//dependencies
const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

// Facebook Tokens
const botID = '1997955997090908'
const fb_token = "helloworld";
const vtoken = "EAAD7x11SrrgBAA4lW3WZBzrhgJgiY8ZCye2Bc9xwVRkBtVAF5ZAk5uiFp9myWRXNxnb997HCfXJfDC3gRlQvSsk5x2ZAlSyiTy7rlPe7nyPJTqxQSemdTlZCXXaC4Nur3l03ME4vug0AOUYjZADsrAoQfozber8v3OPiqmdimRweY4y6ZB56pNZB";

const PORT = process.env.PORT || 5000;

// Initializing app express
const app = express();
// Use Bodyparser as a middleware to parse the header as a json
app.use(bodyParser.json());

// For webhook verification Facebook will send a GET request to our webhook
// It will contain a random challenge number and our verifiy token
// We need to verify the 'verify token' and send back the challenge number
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

// Facebook will send all the messages as a post request to our server at /webhook
// All the message handelings will be done here
app.post('/webhook', (req, res) => {

    if (req.body.entry[0].messaging) {

        let messageEvent = req.body.entry[0].messaging[0];
        let sender = messageEvent.sender.id;
        let recipient = messageEvent.recipient.id;

        // Ignore delivery reports
        if (!messageEvent.delivery && sender != botID) {

            let message = messageEvent.message.text;
            let reply = 'You said: ' + message;
            console.log(sender + ' : ' + message)
            sendMessage(sender, reply);
        }   
    }
    res.sendStatus(200);
});

//listens for connections on the specified port
app.listen(PORT, () => {
    console.log('Listening at', PORT)
});

// Functions to send message
function sendMessage (receiver, msg_text) {
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