const request = require('request');
const vtoken = "EAAD7x11SrrgBAA4lW3WZBzrhgJgiY8ZCye2Bc9xwVRkBtVAF5ZAk5uiFp9myWRXNxnb997HCfXJfDC3gRlQvSsk5x2ZAlSyiTy7rlPe7nyPJTqxQSemdTlZCXXaC4Nur3l03ME4vug0AOUYjZADsrAoQfozber8v3OPiqmdimRweY4y6ZB56pNZB";

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
