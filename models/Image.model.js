const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fileName: String
})


const Image = mongoose.model('Image', ImageSchema);

module.exports = Image;