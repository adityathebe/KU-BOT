const request = require('request');
const fb_token = process.env.FB_TOKEN;

// Functions to send message
var sendMessage = function(sender, messageText) {
    let messageData = {
        recipient: {
            id: sender,
        },
        message: {
            text: messageText,
        }
    }

    return new Promise((resolve, reject) => {
        callSendApi(messageData).then( (msg) => {
            resolve('Successfully sent Text Message');
        }, (errMsg) => {
            reject(errMsg);
        });
    })
}

// Functions for GenericMessage 
var sendGenericMessage = function(sender, data) {
    let messageContent = [];
    for (var i = 0; i < data.length; i++) {
        messageContent.push({
            "title": news.title,
            "subtitle": news.created,
            "image_url": news.img_url,
            "buttons": [
                {
                    "type": "web_url",
                    "url": news.url,
                    "title": (news.btnTitle) ? news.btnTitle : 'Read More'
                }
            ],
        })
    }

    let messageData = {
        recipient: {
            id: sender,
        },
        message: {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": messageContent
                }
            }
        }
    };
    
    return new Promise((resolve, reject) => {
        callSendApi(messageData).then( (msg) => {
            resolve(msg);
        }, (errMsg) => {
            reject(errMsg);
        });
    })
}

const sendQuickReplies = (sender, data) => {
    let messageData =   {
        recipient: {
            id: sender
        },
        message : {
            text: data.text,
            "quick_replies": data.element,
        }
    }
    return new Promise((resolve, reject) => {
        callSendApi(messageData).then( (msg) => {
            resolve(msg);
        }, (errMsg) => {
            reject(errMsg);
        });
    })
}

const callSendApi = (messageData, callback) => {
    return new Promise( (resolve, reject) => {
        request({
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { 
                access_token: fb_token 
            },
            method: 'POST',
            json: messageData
        }, (error, response, body)=> {
            if (!error && response.statusCode == 200) {
                var recipientId = body.recipient_id;
                if (body.message_id)
                    resolve("Message send to : " + recipientId);
            } else {
                reject(`Failed calling Send API ${response.statusCode} ${response.statusMessage} ${body.error}`);
            }
        });  
    })
}

function getUserData(id, callback) {
    let url = `https://graph.facebook.com/v2.11/${id}?access_token=${fb_token}`
    request({url, json:true}, (error, res, body) => {
        let name = `${body.first_name} ${body.last_name}`
        callback(name);
    });
}

module.exports =  {
    sendMessage,
    sendGenericMessage,
    sendQuickReplies,
    getUserData
};
