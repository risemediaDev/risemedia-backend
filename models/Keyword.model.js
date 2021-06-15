const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KeywordSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    keywordName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'default'
    }
})


const Keyword = mongoose.model('Keyword', KeywordSchema);

module.exports = Keyword;