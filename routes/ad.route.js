const express = require('express');
const Router = express.Router();
const Ad = require('../models/Ad.model');
const mongoose = require('mongoose');
const passport = require('passport');

// GET /ad
// ACCESSIBLE to all
// Displays all the ads in the database
Router.get('/', async (req, res, next) => {
    try{
        await Ad
            .find({}).sort({_id: -1}).limit(4)
            .then(result => res.json(result))
            .catch(err => res.json(error)) 
    } catch(error){
        return next(error)
    } 
});

// GET /ad/:id
// ACCESSIBLE to auth user
// Displays a ad by id
Router.get('/:id', passport.authenticate('jwt', {session: false}), (req,res, next)=>{
    try{
        var id = req.params.id;
        Ad
            .find({_id: id})
            .then(result => res.json(result))
            .catch(error => res.json(error));
    } catch(error){
        return next(error);
    }
});

// POST /ad/create
// ACCESSIBLE to authenticated users
// Creates a new ad
Router.post('/create', passport.authenticate('jwt', {session: false}),(req,res, next)=>{
    try{
        const newAd = new Ad({
            _id: new mongoose.Types.ObjectId(),
            image: req.body.imgSrc,
            expiresOn: req.body.expiresOn,
            proprietor: req.body.proprietor,
            targetSpace: req.body.targetSpace,
        })
        newAd
            .save()
            .then(result => res.send(result))
            .catch(err => res.send(err))
    } catch(error){
        return next(error);
    }
});


// DELETE /ad/delete/:id
// ACCESSIBLE to authenticated users
// Deletes a category by id
Router.delete('/delete/:id', passport.authenticate('jwt', {session: false}),(req,res, next)=>{
    try{
        Ad
            .deleteOne({_id: req.params.id})
            .then(result => res.send(result))
            .catch(err => res.send(err))
    }catch(error){
        return next(error);
    }
});


module.exports = Router;