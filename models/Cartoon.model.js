const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartoonSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    image: {type: String, required: true},
    publishedOn: {type: Number, default: new Date().getTime()},
})


const Cartoon = mongoose.model('Cartoon', CartoonSchema);

module.exports = Cartoon;