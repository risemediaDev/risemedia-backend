const express = require("express");
const Router = express.Router();
const Article = require("../models/Article.model")
const mongoose = require('mongoose')
const passport = require('passport');
const { validate, getArticleValidationRules, createArticleValidationRules } = require('../validators/articleValidator');

// GET /article
// ACCESSIBLE to all
// Displays all the articles in the database
Router.get('/', getArticleValidationRules(), validate, async (req,res)=>{
    var criteria = {
        isReviewed: false,
        isDeleted: false,
    };
    var page = 1;
    var articlesPerPage = 3;
    var totalArticles = await Article.countDocuments();
    var skip = 0;

    switch(req.body && req.body.criteria){
        case 'articleId':
            criteria._id = req.body.articleId
            break;
        case 'location':
            criteria.location = req.body.locationId;
            break;
        default:
            break;
    };

    page = req.body && req.body.page;
    skip = (page-1) * articlesPerPage;

    try{
        await Article
            .find(criteria).sort({publishedOn: -1}).limit(articlesPerPage).skip(skip)
            .populate({path: 'author', select: 'username firstName lastName -_id'})
            .populate('categoryId')
            .populate({path: 'location', select: 'name -_id'})
            .then(result => res.json(result))
            .catch(error => res.json(error));

    } catch (error){
        return next(error);
    }
      
});

//POST /article/create
//ACCESSIBLE to authenticated user
//used to store the articles
Router.post('/create', passport.authenticate('jwt', {session: false}), createArticleValidationRules(), validate, function (req, res) {
    if (req.isAuthenticated()){
        const article = new Article({
            _id: new mongoose.Types.ObjectId(),
            title: req.body.title,
            content: req.body.content,
            keywords: req.body.keywords,
            descText: req.body.descText,
            location: req.body.location,
            author: req.body.author,
            categoryId: req.body.categoryId,
        })
        article.save()
            .then(result => {
                res.json(result)
            })
            .catch(error => res.json(error));
    }else{
        res.status(401).send("Unauthorized");
    }
    
});

module.exports = Router;