const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KeywordSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    keywordName: String,
    type: String,
})


const Keyword = mongoose.model('Keyword', KeywordSchema);

module.exports = Keyword;