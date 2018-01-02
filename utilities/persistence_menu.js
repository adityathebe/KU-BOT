require('dotenv').config()

const request = require('request');
let token = process.env.TOKEN;

let json_data = {
    setting_type : "call_to_actions",
    thread_state : "existing_thread",
    call_to_actions : [{
        "type":"postback",
        "title":"Subscribe",
        "payload":"PAYLOAD_SUBSCRIBE"
    }, {
        "type":"postback",
        "title":"Notify",
        "payload":"PAYLOAD_NOTIFY"
    }, {
        "type":"postback",
        "title":"Register Teacher",
        "payload":"PAYLOAD_REGISTER"
    }]
}

let url = `https://graph.facebook.com/v2.6/me/thread_settings?access_token=${token}`

request({ url, method: 'POST', json: true, body: json_data } , (err, resp, body) => {
    if (err)
        console.log(err)
    else
        console.log(body)
});