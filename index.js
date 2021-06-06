require('dotenv').config();
const express = require('express');
const path = require('path');
const port = process.env.PORT;
const mongoose = require('mongoose');

// Routes
const indexRouter = require('./routes/index.route');

// -----------create express application------------
const server = express();

// -----------DB connection-------------------------
var mongoURI = '';
var mongoURI =""
if (typeof(port) === 'undefined'){
  mongoURI = "mongodb://localhost:27017/riseMediaDB"
}else{
  mongoURI = process.env.DB
}

// mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
// const connection = mongoose.connection;
// mongoose.set('useCreateIndex', true)

// -----------Route declaration---------------------
server.use('/', indexRouter);

server.listen(port || 5000, function (){
        console.log('server started')
})