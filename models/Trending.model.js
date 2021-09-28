const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TrendingSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    label: {type: String, required: true},
    category: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: true
    },
    isTopic: {type: Boolean, required: true},
    keywords: {type: String, required: true}
})


const Trending = mongoose.model('Trending', TrendingSchema);

module.exports = Trending;