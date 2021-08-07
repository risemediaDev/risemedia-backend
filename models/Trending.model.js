const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TrendingSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    label: {type: String, isRequired: true},
    isTopic: {type: Boolean, isRequired: true},
    keywords: {type: String, isRequired: true}
})


const Trending = mongoose.model('Trending', TrendingSchema);

module.exports = Trending;