var express = require('express');
var router = express.Router();

const { sendTextMessage, getUserData } = require('../Modules/apicalls');
const { getNewsRegisteredUser } = require('../database/fetch');

router.get('/', (req, res) => {
    res.render("Don't access this !");
});

router.post('/', (req, res) => {
    getNewsRegisteredUser()
        .then( (users) => {
            for (user of users) {
                sendTextMessage(user.fb_id, req.body.message).then((msg) => {
                    console.log(`Message sent to ${user.name}`);
                }, (error) => {
                    console.log(error);
                });
            };
            res.redirect('/admin');     
        })
        .catch((err) => {
            console.log('Invalid Secret Message!');
            res.redirect('/admin');
        });
});

module.exports = router;