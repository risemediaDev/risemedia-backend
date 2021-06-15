const express = require('express');
const Router = express.Router();
const Category = require('../models/Category.model');
const mongoose = require('mongoose');
const passport = require('passport');

// GET /category
// ACCESSIBLE to Auth user
// Displays all the categories in the database
Router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    if(req.isAuthenticated()){
        Category
            .find({})
            .then(result => res.json(result))
            .catch(err => res.json(error))
    }    
});

// GET /category/:id
// ACCESSIBLE to auth user
// Displays a category by a set criteria
Router.get('/', passport.authenticate('jwt', {session: false}), (req,res)=>{
    if(req.isAuthenticated()){
        var id = req.body.id;
        Category
            .find({_id: id})
            .then(result => res.json(result))
            .catch(error => res.json(error));
    }
});

// POST /category/create
// ACCESSIBLE to authenticated users
// Creates a new category
Router.post('/create', passport.authenticate('jwt', {session: false}),(req,res)=>{
    if(req.isAuthenticated()){
        const newCategory = new Category({
            _id: new mongoose.Types.ObjectId(),
            name: req.body.categoryName
        })
        newCategory
            .save()
            .then(result => res.send(result))
            .catch(err => res.send(err))
    }
});


// DELETE /category/delete
// ACCESSIBLE to authenticated users
// Deletes a category by id
Router.delete('/delete', passport.authenticate('jwt', {session: false}),(req,res)=>{
    if(req.isAuthenticated()){
        Category
            .deleteOne({_id: req.body.categoryId})
            .then(result => res.send(result))
            .catch(err => res.send(err))
    }
});


module.exports = Router;