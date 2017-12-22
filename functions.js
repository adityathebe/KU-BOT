const request = require('request');
const fb_token = process.env.FB_TOKEN;

// Functions to send message
function sendMessage(receiver, msg_text) {
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
        "qs": { "access_token": fb_token },
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

function getUserData(id, callback) {
    let url = `https://graph.facebook.com/v2.11/${id}?access_token=${vtoken}`
    request({url, json:true}, (error, res, body) => {
        callback(body.first_name);
    }) 
}

module.exports =  {
    sendMessage,
    getUserData
};
