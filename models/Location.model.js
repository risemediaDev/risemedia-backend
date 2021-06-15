const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    latitude: {type:Number, required: true},
    longitude: {type:Number, required: true},
    name: {type:String, required: true, unique: true, index: true},
})


const Location = mongoose.model('Location', LocationSchema);

module.exports = Location;