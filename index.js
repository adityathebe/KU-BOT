const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

// Facebook Tokens
const token = process.env.token;
const vtoken = process.env.vtoken;

const PORT = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hey There !');
});

app.get('/webhook', (req, res) => {
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === token) {
          
            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
    
        } else {
            res.sendStatus(403);      
        }
    } else {
        res.sendStatus(403);
    }
})

app.post('/webhook', (req, res) => { 
    let body = req.body;
    console.log('Webhook post request')
    if (body.object === 'page') {
        body.entry.forEach((entry) => {
            let webhookEvent = entry.messaging[0];
            let sender = webhookEvent.sender.id;
            let message = webhookEvent.message.text;
            
            console.log('body', JSON.stringify(webhookEvent, null, 4))
            callSendAPI(sender, message)
        });
    } else {
        res.sendStatus(404);
    }
});

app.listen(PORT, () => {
    console.log('Listening at', PORT)
})

function callSendAPI(sender_psid, response) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    }

    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": vtoken },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
        console.error("Unable to send message:" + err);
        }
    }); 
}