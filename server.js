require('dotenv').config();
const express = require('express');
const path = require('path');
const port = process.env.PORT;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('./config/auth');
require('./config/env-config')
const gridFS = require('gridfs-stream')
const passport = require('passport');
const https = require('https');
const fs = require('fs')
// -----------create express application------------
const server = express();
server.use(bodyParser.json()); 
server.use(bodyParser.urlencoded({ extended: false }));

// server.use(passport.intialize())


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

// const options = {
//   key: fs.readFileSync('./key.pem'),
//   cert: fs.readFileSync('./cert.pem')
// };

// // https.createServer(options, function (req, res) {
// //   res.writeHead(200);
// //   res.end("hello world\n");
// // }).listen(5000);

// // var httpServer = http.createServer(app);
// var httpsServer = https.createServer(options, server);

// // httpServer.listen(8080);
// httpsServer.listen(5000);
