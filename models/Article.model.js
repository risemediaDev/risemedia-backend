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
    isDraft:{
        type: Boolean,
        default: true,
    },
    publishedOn:{
        type: Number, 
        default: new Date().getTime()
    },
    isPublished:{
        type: Boolean,
        default: false
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
    },
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId , 
        ref: 'SubCategory', 
    },
    isHeadline:{
        type: Boolean, 
        default: false
    },
    isGeneralNews:{
        type: Boolean, 
        default: false
    }
});


const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;