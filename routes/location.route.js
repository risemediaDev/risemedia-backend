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
        var page = 1;
        var locationPerPage = 5;
        var skip = 0;
        
        page = req.query && req.query.page;
        skip = (page-1) * locationPerPage;
        
        await Location
            .find({}).limit(locationPerPage).skip(skip)
            .then(result => {
                console.log(`Sent list of locations ${page}`);
                res.status(200).json(result);
            })
            .catch(err => {
                console.log('Failed to send list of locations because ' + err)
                res.status(400).json(err)
            }) 
    } catch(error){
        return next(error)
    } 
});

// GET /location/id
// ACCESSIBLE to auth user
// Displays a location by id
Router.get('/id', passport.authenticate('jwt', {session: false}), (req,res, next)=>{
    try{
        var idList = req.query.id;
        Location
            .find({_id: { $in: idList}})
            .then(result => res.json(result))
            .catch(error => res.status(400).json(error));
    } catch(error){
        return next(error);
    }
});

// POST /location/add
// ACCESSIBLE to authenticated users
// adds a new location
Router.post('/add', passport.authenticate('companyUser', {session: false}),(req,res, next)=>{
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