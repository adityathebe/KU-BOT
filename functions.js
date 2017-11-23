const request = require('request');
const vtoken = "EAAD7x11SrrgBAEZBz1ZAJiLRqrLIALRZAw1OulqyxPvJQ3BnwNpbRhYxB20JMU10ySkx1wUAGJpKFM44FzWn8auhdhY84TJkdOXVTElMPFMnfGMARlaoNr3VaEAwfT7HBz446Bfca7VVDpvMZBqpItsO1B4puEmFLfu9PE1Sf0pYvctfzCUD";

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
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    }); 
}

module.exports = sendMessage;