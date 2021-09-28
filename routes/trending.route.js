const express = require('express');
const Router = express.Router();
const Trending = require('../models/Trending.model');
const mongoose = require('mongoose');
const passport = require('passport');
const { request } = require('express');

// GET /trending
// ACCESSIBLE to authorized admins and superadmins
// Displays all the trendings in the database
Router.get('/', async (req, res) => {
    var page = 1;
    var trendingsPerPage = 10;
    var skip = 0;
    page = req.query && req.query.page || 1;
    skip = (page - 1) * trendingsPerPage;

    const today = new Date().getTime();
    let query = {};

    switch (req.query && req.query.criteria) {
        case 'topic':
            query = { isTopic: true }
            break;
        case 'people':
            query = { isTopic: false }
            break;
            
        default:
            break;
    }
    await Trending
        .find(query)
        .sort({ _id: -1 })
        .limit(trendingsPerPage)
        .skip(skip)
        .populate({ path: 'category', select: 'name -_id' })
        .then(result => {
            console.log(`Sent list of trendings by creteria ${req.query.criteria}`)
            res.json(result)

        })
        .catch(err => {
            console.log(`failed to send list of trendings because ${err}`)
            res.json({ error: err })
        })
});

// GET /trending/:id
// ACCESSIBLE to auth user
// Displays a trending by id
Router.get('/:id', passport.authenticate('authAdmin', { session: false }), (req, res, next) => {
    try {
        var id = req.params.id;
        Trending
            .find({ _id: id })
            .then(result => res.json(result))
            .catch(error => res.json(error));
    } catch (error) {
        return next(error);
    }
});

// POST /trending/add
// ACCESSIBLE to authenticated users
// Creates a new trending
Router.post('/add', passport.authenticate('authAdmin', { session: false }), async (req, res, next) => {
    try {
        const newTrend = new Trending({
            _id: new mongoose.Types.ObjectId(),
            label: req.body.label,
            isTopic: req.body.isTopic,
            keywords: req.body.keywords,
            category: req.body.categoryId
        })
        newTrend
            .save()
            .then(result => {
                console.log(`Trend added by ${req.user._id}`)
                res.json(result)
            })
            .catch(err => {
                console.log(`Failed to add trend because ${err}`)
                res.status(400).json({ error: err })
            })
    } catch (error) {
        return next(error);
    }
});

Router.patch('/edit', passport.authenticate('authAdmin', {session: false}), async (req, res) => {
    // if(!req.body.id || !req.body.update) return res.status(400).json({error: 'Required fields not present'});
    var adId = req.body._id;
    delete req.body._id;
    delete req.body.__v;
    var update = req.body;
    await Trending.findByIdAndUpdate(
        { _id: adId },
        { $set: { ...update }},
        { upsert: true, new: true },
        (err, data) => {
          if (err) {
            console.log(`failed to update Trend ${id} requested by ${req.user._id} because of ${err}`)
            res.status(400).json({error: err});
            return;
          }
          console.log(`${data._id} updated by ${req.user._id}`)
          res.json(data)
        })
})
// DELETE /trending/delete/:id
// ACCESSIBLE to authenticated users
// Deletes a trending by id
Router.delete('/delete/:id', passport.authenticate('authAdmin', { session: false }), (req, res) => {
    Trending
        .deleteOne({ _id: req.params.id })
        .then(result => {
            console.log(`Delete trending ${req.params.id} as requested by ${req.user._id}`)
            res.send(result)
        })
        .catch(error => {
            console.log(`Failed to delete Trending ${req.params.id} because ${error}`)
            return res.status(400).json({ error: error });
        })
});


module.exports = Router;