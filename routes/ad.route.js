const express = require('express');
const Router = express.Router();
const Ad = require('../models/Ad.model');
const mongoose = require('mongoose');
const passport = require('passport');
const { request } = require('express');

// GET /ad
// ACCESSIBLE to authorized admins and superadmins
// Displays all the ads in the database
Router.get('/', passport.authenticate('authAdmin', { session: false }), async (req, res) => {
    var page = 1;
    var adsPerPage = 10;
    var skip = 0;
    page = req.query && req.query.page || 1;
    skip = (page - 1) * adsPerPage;

    const today = new Date().getTime();
    let query = {};

    switch (req.query && req.query.criteria) {
        case 'onGoingAds':
            query = { $and: [{ placedOn: { $lt: today } }, { expiresOn: { $gte: today } }] }
            break;
        case 'scheduledAds':
            query = { $and: [{ placedOn: { $gt: today } }, { expiresOn: { $gte: today } }] }
            break;
        default:
            break;
    }
    await Ad
        .find(query)
        .sort({ _id: -1 })
        .limit(adsPerPage)
        .skip(skip)
        .then(result => {
            console.log(`Sent list of ads by creteria ${req.query.criteria}`)
            res.json(result)

        })
        .catch(err => {
            console.log(`failed to send list of ads because ${err}`)
            res.json({ error: err })
        })
});

// GET /ad/:id
// ACCESSIBLE to auth user
// Displays a ad by id
Router.get('/:id', passport.authenticate('authAdmin', { session: false }), (req, res, next) => {
    try {
        var id = req.params.id;
        Ad
            .find({ _id: id })
            .then(result => res.json(result))
            .catch(error => res.json(error));
    } catch (error) {
        return next(error);
    }
});

Router.get('/get/random', async(req, res) => {
    try {
        const today = new Date().getTime();
        Ad.count().exec(function (err, count) {
            var random = Math.floor(Math.random() * count)
            Ad.findOne({ $and: [{ placedOn: { $lt: today } }, { expiresOn: { $gte: today } }] }).skip(random).exec(
                function (err, result) {
                    console.log('sent a ad randomly')
                    res.status(200).send(result)
                })
        })

    } catch (error) {
        console.log(error)
        res.status(400).send({ error: error })
    }
});

// POST /ad/create
// ACCESSIBLE to authenticated users
// Creates a new ad
Router.post('/create', passport.authenticate('authAdmin', { session: false }), async (req, res, next) => {
    try {
        const newAd = new Ad({
            _id: new mongoose.Types.ObjectId(),
            image: req.body.image,
            expiresOn: req.body.expiresOn,
            proprietor: req.body.proprietor,
            targetSpace: req.body.targetSpace,
            placedOn: req.body.placedOn,
        })
        newAd
            .save()
            .then(result => {
                console.log(`Ad created by ${req.user._id}`)
                res.json(result)
            })
            .catch(err => {
                console.log(`Failed to create ad because ${err}`)
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
    await Ad.findByIdAndUpdate(
        { _id: adId },
        { $set: { ...update }},
        { upsert: true, new: true },
        (err, data) => {
          if (err) {
            console.log(`failed to update Ad ${id} requested by ${req.user._id} because of ${err}`)
            res.status(400).json({error: err});
            return;
          }
          console.log(`${data._id} updated by ${req.user._id}`)
          res.json(data)
        })
})
// DELETE /ad/delete/:id
// ACCESSIBLE to authenticated users
// Deletes a ad by id
Router.delete('/delete/:id', passport.authenticate('authAdmin', { session: false }), (req, res) => {
    Ad
        .deleteOne({ _id: req.params.id })
        .then(result => {
            console.log(`Delete ad ${req.params.id} as requested by ${req.user._id}`)
            res.send(result)
        })
        .catch(error => {
            console.log(`Failed to delete Ad ${req.params.id} because ${error}`)
            return res.status(400).json({ error: error });
        })
});


module.exports = Router;