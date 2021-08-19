const express = require("express");
const Router = express.Router();
const Article = require("../models/Article.model")
const Category = require("../models/Category.model");
const mongoose = require('mongoose')
const passport = require('passport');
const { validate, getArticleValidationRules, editArticleValidationRules, createArticleValidationRules } = require('../validators/articleValidator');

// GET /article
// ACCESSIBLE to all
// Displays all the articles in the database
Router.get('/', getArticleValidationRules(), validate, async (req, res) => {
    var criteria = {};
    criteria = {
        isPublished: true,
        isReviewed: true,
        isDeleted: false,
    };
    var page = 1;
    var articlesPerPage = 5;

    var skip = 0;

    switch (req.query && req.query.criteria) {
        case 'articleId':
            criteria._id = req.query.articleId
            break;
        case 'location':
            criteria.location = req.query.locationId;
            break;
        case 'headline':
            criteria.isHeadline = true;
            break;
        case 'categoryName':
            if (!req.query.category) {
                return res.status(400).json({ error: 'category is required' })
            };
            let category = await Category.find({ name: req.query.category });
            if (!category.length) {
                console.log(`category ${req.query.category} doesn't exist`);
                return res.status(200).json(category);
            };
            criteria.categoryId = category[0]._id;
            break;
        default:
            break;
    };

    page = req.query && req.query.page;
    skip = (page - 1) * articlesPerPage;

    try {
        await Article
            .find(criteria).sort({ publishedOn: -1 }).limit(articlesPerPage).skip(skip)
            .populate({ path: 'author', select: 'username firstName lastName -_id' })
            .populate('categoryId')
            .populate({ path: 'location', select: 'name -_id' })
            .then(result => res.json(result))
            .catch(error => res.json(error));

    } catch (error) {
        return next(error);
    }

});

// GET /article/id
// ACCESSIBLE to auth user
// sends articles by id
Router.get('/id', passport.authenticate('jwt', {session: false}), (req,res, next)=>{
    try{
        var idList = req.query.id;
        Article
            .find({_id: { $in: idList}})
            .populate({ path: 'author', select: 'username firstName lastName -_id' })
            .populate('categoryId')
            .populate({ path: 'location', select: 'name -_id' })
            .then(result => res.json(result))
            .catch(error => res.status(400).json(error));
    } catch(error){
        return next(error);
    }
});

// GET /article
// ACCESSIBLE to companyUser
// Displays all the articles in the database
Router.get('/auth', passport.authenticate('companyUser', { session: false }), async (req, res) => {
    var criteria = {};
    if (req.query.status) {
        const isUserAdmin = [0, 1].includes(req.user.role);
        switch (req.query.status) {
            case 'publishedToday':
                criteria.isPublished = true
                criteria.isReviewed = true
                criteria.isDeleted = false
                criteria.isDraft = false
                criteria.publishedOn = { $gt: new Date().setHours(0, 0, 0, 0) }
                break;
            case 'published':
                criteria.isPublished = true
                criteria.isReviewed = true
                criteria.isDeleted = false
                criteria.isDraft = false
                !isUserAdmin && (criteria.author = req.user._id)
                break;
            case 'unPublished':
                criteria.isPublished = false
                criteria.isReviewed = false
                criteria.isDeleted = false
                criteria.isDraft = false
                !isUserAdmin && (criteria.author = req.user._id)
                break;
            case 'draft':
                criteria.isPublished = false
                // criteria.isReviewed = false
                criteria.isDeleted = false
                criteria.isDraft = true
                criteria.author = req.user._id
                break;
            case 'todaysHeadlines':
                criteria.isPublished = true
                criteria.isReviewed = true
                criteria.isHeadline = true
                break;
        }
    }
    criteria.isDeleted = false
    var page = 1;
    var articlesPerPage = 10;
    var totalArticles = await Article.countDocuments();
    var skip = 0;

    page = req.query && req.query.page;
    skip = (page - 1) * articlesPerPage;

    try {
        await Article
            .find(criteria).sort({ publishedOn: -1 }).limit(articlesPerPage).skip(skip)
            .populate({ path: 'author', select: 'username firstName lastName -_id' })
            .populate('categoryId').populate('subCategoryId')
            .populate({ path: 'location', select: 'name _id' })
            .then(result => res.json(result))
            .catch(error => res.json(error));

    } catch (error) {
        return next(error);
    }

});

Router.get('/search', async (req, res) => {
    let searchString = req.query && req.query.searchString;
    if(!searchString) return res.status(400).json({error: 'No searchString'})
    var page = 1;
    var articlesPerPage = 5;

    var skip = 0;

    var words = []
    if(searchString.includes(',')){
        words = searchString.split(',')
    }else{
        words = searchString.split(' ')
    }
    var regexMetachars = /[(){[*+?.\\^$|]/g;
    for (var i = 0; i < words.length; i++) {
        words[i] = words[i].replace(regexMetachars, "\\$&").trim();
        if(words[i] == ""){
            words.splice(i, 1)
        }
    }
    var regex = new RegExp("\\b(?:" + words.join("|") + ")\\b", "gi");
    page = req.query && req.query.page;
    skip = (page - 1) * articlesPerPage;
    let articlesCat = await Article
        .find({ $or: [
            { title: { $regex: regex } }, 
            { keywords: { $regex: regex } }
        ]}).sort({ publishedOn: -1 }).limit(articlesPerPage).skip(skip)
        .populate({ path: 'author', select: 'username firstName lastName -_id' })
        .populate('categoryId').populate('subCategoryId')
        .populate({ path: 'location', select: 'name _id' })

    return res.json(articlesCat)
})

//POST /article/create
//ACCESSIBLE to authenticated user
//used to store the articles
Router.post('/create', passport.authenticate('jwt', { session: false }), createArticleValidationRules(), validate, function (req, res) {
    if(!req.body) return res.status(400).json({error: 'No data received'});
    let articleData = req.body
    for (var propName in articleData) {
        if (articleData[propName] === null || articleData[propName] === undefined || articleData[propName] === "") {
          delete articleData[propName];
        }
      }
    if (req.isAuthenticated()) {
        const article = new Article({
            _id: new mongoose.Types.ObjectId(),
            ...articleData,
            author: req.user._id
        })
        article.save()
            .then(result => {
                console.log(`${req.user._id} created article ${result._id}`)
                res.status(200).json(result)
            })
            .catch(error => {
                console.log(`Failed to create a new article because ${error}`)
                res.status(400).json({ error: error })
            });
    } else {
        res.status(401).send("Unauthorized");
    }

});

Router.patch('/edit', passport.authenticate('companyUser', { session: false }), editArticleValidationRules(), async (req, res) => {
    // if(!req.body.id || !req.body.update) return res.status(400).json({error: 'Required fields not present'});
    var id = req.body._id;
    delete req.body._id;
    if (req.body.__v) { delete req.body.__v };
    var update = req.body;
    for (var propName in update) {
        if (update[propName] === null || update[propName] === undefined || update[propName] === "") {
          delete update[propName];
        }
      }
    await Article.findByIdAndUpdate(
        { _id: id },
        { $set: { ...update } },
        { upsert: true, new: true },
        (err, data) => {
            if (err) {
                console.log(`failed to update Article ${id} requested by ${req.user._id} because of ${err}`)
                res.status(400).json({ error: err });
                return;
            }
            console.log(`article ${data._id} updated by ${req.user._id}`)
            res.json(data)
        })
})

// patch /article/delete/:id
// ACCESSIBLE to authenticated users
// Deletes a ad by id
Router.patch('/delete/:id', passport.authenticate('companyUser', { session: false }), (req, res) => {
    Article
        .findByIdAndUpdate({ _id: req.params.id }, { $set: { isDeleted: true } }, { upsert: true, new: true })
        .then(result => {
            console.log(`Deleted article ${req.params.id} as requested by ${req.user._id}`)
            res.send(result)
        })
        .catch(error => {
            console.log(`Failed to delete article ${req.params.id} because ${error}`)
            return res.status(400).json({ error: error });
        })
});

// patch /article/submit/:id
// ACCESSIBLE to authenticated users
// Submit article by id
Router.patch('/submit/:id', passport.authenticate('companyUser', { session: false }), (req, res) => {
    Article
        .findByIdAndUpdate({ _id: req.params.id }, { $set: { isDraft: false } }, { upsert: true, new: true })
        .then(result => {
            console.log(`Submitted article ${req.params.id} as requested by ${req.user._id}`)
            res.send(result)
        })
        .catch(error => {
            console.log(`Failed to Submit article ${req.params.id} because ${error}`)
            return res.status(400).json({ error: error });
        })
});

module.exports = Router;