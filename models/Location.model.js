const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    latitude: String,
    longitude: String,
    name: String,
})


const Location = mongoose.model('Location', LocationSchema);

module.exports = Location;