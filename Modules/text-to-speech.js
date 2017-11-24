const http = require('http');
const fs = require('fs');

const API_KEY = '0f89d82122c34da39bcfc56f84f9b005';

function getSpeech (text) {
    let url = `http://api.voicerss.org/?key=${API_KEY}&hl=en-in&src=${text}`;

    let file = fs.createWriteStream('audio.mp3');
    http.get(url, (body) => {
        body.pipe(file);
    })
}

getSpeech('hello world')

module.exports = getSpeech;