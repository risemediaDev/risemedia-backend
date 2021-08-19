const express = require('express');
const Router = express.Router();
const Cartoon = require('../models/Cartoon.model');
const mongoose = require('mongoose');
const passport = require('passport');
const { request } = require('express');

// GET /cartoon
// ACCESSIBLE to authorized admins and superadmins
// Displays all the cartoons in the database
Router.get('/', passport.authenticate('authAdmin', { session: false }), async (req, res) => {
    var page = 1;
    var cartoonsPerPage = 10;
    var skip = 0;
    page = req.query && req.query.page || 1;
    skip = (page - 1) * cartoonsPerPage;

    const today = new Date().getTime();
    let query = {};

    switch (req.query && req.query.criteria) {
        case 'publishedToday':
            query = { publishedOn: {$gt: new Date().setHours(0,0,0,0)} }
            break;
        // case 'all':
        //     query = { }
        //     break;
        default:
            break;
    }
    await Cartoon
        .find(query)
        .sort({ publishedOn: -1 })
        .limit(cartoonsPerPage)
        .skip(skip)
        .then(result => {
            console.log(`Sent list of cartoons by creteria ${req.query.criteria}`)
            res.json(result)

        })
        .catch(err => {
            console.log(`failed to send list of cartoons because ${err}`)
            res.json({ error: err })
        })
});

// GET /cartoon/:id
// ACCESSIBLE to auth user
// Displays a cartoon by id
Router.get('/:id', passport.authenticate('authAdmin', { session: false }), (req, res, next) => {
    try {
        var id = req.params.id;
        Cartoon
            .find({ _id: id })
            .then(result => res.json(result))
            .catch(error => res.json(error));
    } catch (error) {
        return next(error);
    }
});

Router.get('/get/random', async(req, res) => {
    try {
        Cartoon.count().exec(function (err, count) {
            var random = Math.floor(Math.random() * count)
            Cartoon.findOne().skip(random).exec(
                function (err, result) {
                    console.log('sent a cartoon randomly')
                    res.status(200).send(result)
                })
        })

    } catch (error) {
        console.log(error)
        res.status(400).send({ error: error })
    }
});

// POST /cartoon/add
// ACCESSIBLE to authenticated users
// Creates a new cartoon
Router.post('/add', passport.authenticate('authAdmin', { session: false }), async (req, res, next) => {
    try {
        const newCartoon = new Cartoon({
            _id: new mongoose.Types.ObjectId(),
            image: req.body.image,
        })
        newCartoon
            .save()
            .then(result => {
                console.log(`Cartoon added by ${req.user._id}`)
                res.json(result)
            })
            .catch(err => {
                console.log(`Failed to add cartoon because ${err}`)
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
    await Cartoon.findByIdAndUpdate(
        { _id: adId },
        { $set: { ...update }},
        { upsert: true, new: true },
        (err, data) => {
          if (err) {
            console.log(`failed to update Cartoon ${id} requested by ${req.user._id} because of ${err}`)
            res.status(400).json({error: err});
            return;
          }
          console.log(`${data._id} updated by ${req.user._id}`)
          res.json(data)
        })
})
// DELETE /cartoon/delete/:id
// ACCESSIBLE to authenticated users
// Deletes a cartoon by id
Router.delete('/delete/:id', passport.authenticate('authAdmin', { session: false }), (req, res) => {
    Cartoon
        .deleteOne({ _id: req.params.id })
        .then(result => {
            console.log(`Delete cartoon ${req.params.id} as requested by ${req.user._id}`)
            res.send(result)
        })
        .catch(error => {
            console.log(`Failed to delete Cartoon ${req.params.id} because ${error}`)
            return res.status(400).json({ error: error });
        })
});


module.exports = Router;