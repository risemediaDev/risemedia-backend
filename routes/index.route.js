const express = require('express');
const Router = express.Router();

Router.get('/', function (req, res) {
        // res.sendFile('./index.html');
        res.send('hi')
})

module.exports = Router;