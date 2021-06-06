const express = require('express');
const Router = express.Router();

Router.get('/', function (req, res) {
        res.send('welcome to rise media');
})

module.exports = Router;