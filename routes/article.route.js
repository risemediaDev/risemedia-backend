const express = require("express");
const Router = express.Router();
const Article = require("../models/Article.model")
const mongoose = require('mongoose')

// GET /article
// ACCESSIBLE to all
// Displays all the articles in the database
Router.get('/',(req,res)=>{
    if(req.params.articleId){
        Article
            .find({_id: req.params.articleId})
            .then(result => res.json(result))
            .catch(error => res.json(error)) 
    }else{
        Article
            .find({reviewed: true})
            .then(result => res.json(result))
            .catch(error => res.json(error));
    }
    
    // Article.find({reviewed:true}).populate('author')
    //     .exec(function (err, articles) {
    //         if (err){
    //             res.json(err)
    //         }else{
    //             res.json(articles)
    //         }
    //     })
})


//POST /articles/create
//ACCESSIBLE to authenticated user
//used to store the articles
Router.post('/compose', function (req, res) {
    const article = new Article({
        _id: new mongoose.Types.ObjectId(),
        author: req.body.author,
        title: req.body.title,
        body: req.body.receivedData,
    })
    article.save()
        .then(result => res.json(result))
        .catch(error => res.json(error))
})


// GET /articles/someArticleId
// ACCESSIBLE to all
// Displays a particular article. Find that article by Id.
Router.get("/", function (req, res) {
    console.log(req.params.articleId)
    Article
        .find({_id: req.params.articleId})
        // .populate('author')
        // .exec(function (err, article) {
        //     if (err){
        //         res.send(err)
        //     }else{
        //         res.json(article)
        //     }
        // })
        .then(result => res.json(result))
        .catch(error => res.json(error))
})


// //GET   /articles/compose
// //ACCESSIBLE to the authenticated users only
// //shows a page from where article can be written
// Router.get('/compose', function (req, res) {
//   if (req.isAuthenticated()) {
//     // if(true){
//     res.render('composeArticle');
//   } else {
//     statusFlag = 2
//     req.session.returnTo = '/articles/compose/'
//     res.render("authorize", {
//       msg: statusFlag
//     })
//   }
//   // res.render('composeArticle')
// })



// //POST /articles/vote/id/status
// //ACCESSIBLE to all
// //increases or decreases the vote count of an article, found by id, depending upon the status 
// Router.post('/vote/:id/:status', function(req, res){
//       Article.updateOne({ _id: req.params.id }, { $inc: { "meta.votes": req.params.status}  }, function(err, response) {
//         if (err) {
//         console.log(err)
//           res.send(err);
//        } else {
//         res.cookie(req.params.id, req.params.status);
//         res.send(response);
//       }
//       })
//     });

module.exports = Router;