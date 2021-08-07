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
const fs = require('fs');
const cors = require('cors');

// -----------create express application------------
const server = express();
server.use(bodyParser.json()); 
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cors());
// server.use(passport.intialize())


// Routes
const indexRouter = require('./routes/index.route');
const userRouter = require('./routes/user.route');
const articleRouter = require('./routes/article.route');
const categoryRouter = require('./routes/category.route');
const adRouter = require('./routes/ad.route');
const locationRouter = require('./routes/location.route');
const fileRouter = require('./routes/file.route');
const cartoonRouter = require('./routes/cartoon.route');
const trendingRouter = require('./routes/trending.route');

// -----------DB connection-------------------------
var mongoURI = "";
if (typeof(port) === 'undefined'){
  mongoURI = "mongodb://localhost:27017/riseMediaDB"
}else{
  mongoURI = "mongodb+srv://admin-prochnost:COXAbe9tHmKeyB6i@prochnost.i6wgh.mongodb.net/risemediaDB"
}

mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true})
const connection = mongoose.connection;
connection.on('connecting', () => console.log('Connecting to DB'));
connection.on('open', () => console.log('Connected to DB. URI='+mongoURI));
connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false);
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
server.use('/cartoon', cartoonRouter);
server.use('/trending', trendingRouter);

server.listen(port || 5000, function (){
        console.log('server started @ '+ (port || 'localhost:5000'));
});