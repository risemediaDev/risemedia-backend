const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    image: String,
    placedOn: Date,
    expiresOn: Date,
    proprietor: String,
    targetSpace: String,
})


const Ad = mongoose.model('Ad', AdSchema);

module.exports = Ad;