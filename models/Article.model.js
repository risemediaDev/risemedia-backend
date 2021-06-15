const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: {type: String, required: true},
    content: String,
    keywords: String,
    articleHeadImage: String,
    descText: String,
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    lastModifiedOn: {
        type: Number, 
        default: new Date().getTime()
    },
    publishedOn:{
        type: Number, 
        default: new Date().getTime()
    },
    views: {
        type: Number, 
        default: 0
    },
    isDeleted: {
        type: Boolean, 
        default: false
    },
    isReviewed: {
        type: Boolean, 
        default: false
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId , 
        ref: 'Category', 
        required: true
    }
});


const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;