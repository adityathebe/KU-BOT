const express = require('express');
const bodyParser = require('body-parser');

// Facebook Tokens
const fb_token = "helloworld";
const vtoken = "EAAD7x11SrrgBAEZBz1ZAJiLRqrLIALRZAw1OulqyxPvJQ3BnwNpbRhYxB20JMU10ySkx1wUAGJpKFM44FzWn8auhdhY84TJkdOXVTElMPFMnfGMARlaoNr3VaEAwfT7HBz446Bfca7VVDpvMZBqpItsO1B4puEmFLfu9PE1Sf0pYvctfzCUD"

// Our Messagin Functions
const sendMessage = require('./functions');

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
    res.sendStatus(200);

    let messageEvent = req.body.entry[0].messaging[0];

    let sender = messageEvent.sender.id;
    let recipient = messageEvent.recipient.id;
    let message = messageEvent.message.text;

    console.log('Message:', message)
    sendMessage(sender, message);
});

app.listen(PORT, () => {
    console.log('Listening at', PORT)
})
