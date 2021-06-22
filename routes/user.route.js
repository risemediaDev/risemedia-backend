const express = require("express");
const passport = require("passport");
const Router = express.Router();
const User = require("../models/User.model");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config/env-config');

// GET /users
// ACCESSIBLE to all
// Displays list of all users.
Router.get("/", (req,res)=>{
    User.find({},(err, Users)=>{
        if(err){
            res.json(err);
        }else{
            res.json(Users)
        }
    })
});


// POST /user/signup
// ACCESSIBLE to all
// Creates a new user in the database
Router.post("/signup", passport.authenticate('signup', {session: false}) , async (req, res, next) => {
    res.json({
        message: 'user created successfully',
        user: req.user
    })
})

// POST /user/login
// ACCESSIBLE to all
// Creates a new user in the database
Router.post('/login', async (req, res, next) => {
      passport.authenticate('local', {failureRedirect: config.config.baseUrl + '/user/login/failed'},async (err, user, info) => {
          try {
            if (err || !user) {
              const error = new Error('An error occurred.');
              res.send(info);
            }
            req.login(user, { session: false }, async (error) => {
                if (error) return next(error);
                const body = { _id: user._id, username: user.username };
                const token = jwt.sign({ user: body }, process.env.LOCAL_TOKEN_SECRET);
                return res.json({ token });
            });
          } catch (error) {
            return next(error);
          }
        }
      )(req, res, next);
    }
  );


// GET /user/login/google/callback
// ACCESSIBLE to all
// Authentication using google
Router.get('/login/google/callback',
    passport.authenticate('google', {failureRedirect: config.config.baseUrl + '/user/login/failed', session: false}),
    function (req, res) {
      // Successful authentication, sendToken     
      req.login(req.user, { session: false }, async (error) => {
        if (error) return res.send(error);
        const body = { _id: req.user._id, username: req.user.username };
        const token = jwt.sign({ user: body }, process.env.LOCAL_TOKEN_SECRET);
        return res.json({ token });
    });
      
    });

// GET /user/login/facebook/callback
// ACCESSIBLE to all
// Authentication using facebook
Router.get('/login/facebook/callback',
    passport.authenticate('facebook', {failureRedirect: config.config.baseUrl + '/user/login/failed', session: false}),
    function (req, res) {
      // Successful authentication, sendToken     
      req.login(req.user, { session: false }, async (error) => {
        if (error) return res.send(error);
        const body = { _id: req.user._id, username: req.user.username };
        const token = jwt.sign({ user: body }, process.env.LOCAL_TOKEN_SECRET);
        return res.json({ token });
    });
      
    });

Router.get('/login/failed', (req, res) => {
  res.send('failed')
})
module.exports = Router