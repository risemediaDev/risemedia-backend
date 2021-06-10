const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    content: String,
    keywords: String,
    articleHeadImage: String,
    descText: String,
    location: String,
    author: String,
    lastModifiedOn: {type: Number, default: new Date().getTime()},
    views: {type: Number, default: 0},
    isDeleted: {type: Boolean, default: false},
    isReviewed: {type: Boolean, default: false},
    categoryId: String
});


const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;