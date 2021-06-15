const express = require('express');
const Router = express.Router();
const Location = require('../models/Location.model');
const mongoose = require('mongoose');
const passport = require('passport');

// GET /location
// ACCESSIBLE to all
// Displays all the locations in the database
Router.get('/', async (req, res, next) => {
    try{
        await Location
            .find({})
            .then(result => res.json(result))
            .catch(err => res.json(error)) 
    } catch(error){
        return next(error)
    } 
});

// GET /location/:id
// ACCESSIBLE to auth user
// Displays a location by id
Router.get('/:id', passport.authenticate('jwt', {session: false}), (req,res, next)=>{
    try{
        var id = req.params.id;
        Location
            .find({_id: id})
            .then(result => res.json(result))
            .catch(error => res.json(error));
    } catch(error){
        return next(error);
    }
});

// POST /location/create
// ACCESSIBLE to authenticated users
// Creates a new location
Router.post('/create', passport.authenticate('jwt', {session: false}),(req,res, next)=>{
    try{
        const newLocation = new Location({
            _id: new mongoose.Types.ObjectId(),
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            name: req.body.name,
        })
        newLocation
            .save()
            .then(result => res.send(result))
            .catch(err => {
                res.status(400).send({message: err.message})
            })
    } catch(error){
        return next(error);
    }
});


// DELETE /location/delete/:id
// ACCESSIBLE to authenticated users
// Deletes a location by id
Router.delete('/delete/:id', passport.authenticate('jwt', {session: false}),(req,res, next)=>{
    try{
        Location
            .deleteOne({_id: req.params.id})
            .then(result => res.send(result))
            .catch(err => res.send(err))
    }catch(error){
        return next(error);
    }
});


module.exports = Router;