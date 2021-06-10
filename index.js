require('dotenv').config();
const express = require('express');
const path = require('path');
const port = process.env.PORT;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('./auth/auth');

// -----------create express application------------
const server = express();
server.use(bodyParser.json()); 
server.use(bodyParser.urlencoded({ extended: false }));


// Routes
const indexRouter = require('./routes/index.route');
const userRouter = require('./routes/user.route');
const articleRouter = require('./routes/article.route');

// -----------DB connection-------------------------
var mongoURI = "";
if (typeof(port) === 'undefined'){
  mongoURI = "mongodb://localhost:27017/riseMediaDB"
}else{
  mongoURI = process.env.DB
}

mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.set('useCreateIndex', true)

// -----------Route declaration---------------------
server.use('/', indexRouter);
server.use('/user', userRouter);
server.user('/article', articleRouter);

server.listen(port || 5000, function (){
        connection && console.log('DB connected')
        console.log('server started')
})