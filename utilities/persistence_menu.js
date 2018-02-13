const request = require('request');
const fb_token = "EAAD7x11SrrgBAMb020qe78oWRfWmOzfoRCiNMsy6fDGvevPJeaVG4TzuREyHzxAjXUjZByYggrM0TundExr4cS3SmBJOGZBI2LQZCmu4LhSOZA2xvGUGGz1KAZBJZAEFNaCINv9c5k4uhnLzkI3FpiiIrh2SNZB7LlvuxIDusWGRByXAdiy9h9c";

let json_data = {
    persistent_menu : [{
        "locale": "default",
        "composer_input_disabled": false,
        call_to_actions : [
            {
                "type":"postback",
                "title":"Subscribe",
                "payload":"PAYLOAD_SUBSCRIBE"
            }, 
            {
                "title":"Student",
                "type":"nested",
                "call_to_actions": [
                    {
                        "type": "postback",
                        "title": "Register",
                        "payload": "REGISTER_STUDENT"
                    }, {
                        "type": "postback",
                        "title": "Notify",
                        "payload": "CR_NOTIFY"
                    }
                ]
            },
            {
                "title":"Teacher",
                "type":"nested",
                "call_to_actions": [
                    {
                        "type": "postback",
                        "title": "Register",
                        "payload": "REGISTER_TEACHER"
                    }, {
                        "type": "postback",
                        "title": "Notify",
                        "payload": "TEACHER_NOTIFY"
                    },
                    {
                        "type": "postback",
                        "title": "Add New Class",
                        "payload": "ADD_CLASS"
                    }
                ]
            }
        ]
    }]    
}

let url = `https://graph.facebook.com/v2.6/me/messenger_profile?access_token=${fb_token}`

request({ url, method: 'POST', json: true, body: json_data } , (err, resp, body) => {
    if (err)
        console.log(err)
    else
        console.log(body)
});