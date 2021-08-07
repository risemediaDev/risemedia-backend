const express = require('express');
const Router = express.Router();
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const mongoose = require('mongoose');
const Image = require('../models/Image.model');
const passport = require('passport');
const fs = require('fs');

// set storage engine for multer
const storage = multer.diskStorage({destination:'../tmp/uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload 
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('headImage')

// File filter
function checkFileType(file, cb) {
  //allowed ext 
  const fileTypes = /jpeg|jpg|png|gif|webp/;
  //check ext
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  //check mime
  const mimetype = fileTypes.test(file.mimetype);
  if (mimetype && extName) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
};


// POST file/upload/image
// ACCESSIBLE to auth user
// upload image to db
Router.post("/upload/image", passport.authenticate('jwt', {session: false}),function (req, res) {
  upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        console.log(err);
      } else if (err) {
        console.log(err);
      }
      var filepath = req.file && req.file.path;
      var filename = req.file && req.file.filename;
      if(!filepath || !filename)  {
        console.log(`failed to upload image as filepath not present ${filepath} ${filename}`)
        return res.status(400).json({message: 'file not uploaded'})
      }
      // res.send(__dirname+'\\..\\tmp\\uploads\\')
      sharp(filepath).resize({
              width: 1000
            }).toBuffer(function (err, buf) {
              if (err) return next(err)
              const image = buf.toString('base64');
              fs.writeFile('../tmp/uploads/' +filename, image, {
                encoding: 'base64'
              }, function (err) {
                if (err) {
                  console.log(err)
                }
              })
            })
  
      const image = new Image({
        _id: new mongoose.Types.ObjectId(),
        fileName: req.file.filename,
      })
      image.save()
      .then(result => {
        fs.createReadStream('../tmp/uploads/' + filename)
          .pipe(gridFSBucket.openUploadStream(req.file.filename))
          .on('error',function(error){console.log(error)})
          .on('finish',function(){
            console.log('fileUploaded')
            res.json(result)
          })
        })
        .catch(err => res.json(error))
    })
  
  })
    
// GET /file/get/:filename/:width
// ACCESSIBLE to auth user
// Display Image according to width
Router.get('/get/:filename/:width', (req, res) => {
  
  if(!req.params.filename)return res.status(400).json({error: 'filename not found'});
  try{
    const filestream = gridFSBucket.openDownloadStreamByName(req.params.filename)
  var transformer = sharp()
    .resize(parseInt(req.params.width)).webp()
  filestream.pipe(transformer).pipe(res);  
  } catch (error) {
    res.status(400).json({error: error})
  }
  
});
 

// GET /file/get/:filename
// ACCESSIBLE to auth user
// Display Image by filename
Router.get('/get/:filename',(req,res)=>{
  try{
    if(!req.params || !req.params.filename || req.params.filename == 'undefined') return res.status(400).json({error: 'filename not found'});
    gridFSBucket.openDownloadStreamByName(req.params.filename).pipe(res)
} catch (error) {
  res.status(400).json({error: error})
}
})

module.exports = Router