const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    image: {type: String, required: true},
    placedOn: {type: Number, required: true},
    expiresOn: {type: Number, required: true},
    proprietor: {
        name: {type: String, required: true},
        clientId: {type: String, required: true},
    },
    targetSpace: {type: String, required: true},
})


const Ad = mongoose.model('Ad', AdSchema);

module.exports = Ad;