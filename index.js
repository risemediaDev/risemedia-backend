require('dotenv').config();
const express = require('express');
const path = require('path');
const port = process.env.PORT;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('./auth/auth');
const gridFS = require('gridfs-stream')

// -----------create express application------------
const server = express();
server.use(bodyParser.json()); 
server.use(bodyParser.urlencoded({ extended: false }));


// Routes
const indexRouter = require('./routes/index.route');
const userRouter = require('./routes/user.route');
const articleRouter = require('./routes/article.route');
const categoryRouter = require('./routes/category.route');
const adRouter = require('./routes/ad.route');
const locationRouter = require('./routes/location.route');
const fileRouter = require('./routes/file.route');

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

//-----------gfs----------------------------------
gridFS.mongo = mongoose.mongo;
connection.once('open', function () {
  gridFSBucket = new mongoose.mongo.GridFSBucket(connection.db);
})


// -----------Route declaration---------------------
server.use('/', indexRouter);
server.use('/user', userRouter);
server.use('/article', articleRouter);
server.use('/category', categoryRouter);
server.use('/ad', adRouter);
server.use('/location', locationRouter);
server.use('/file', fileRouter);

server.listen(port || 5000, function (){
        connection && console.log('DB connected')
        console.log('server started')
})